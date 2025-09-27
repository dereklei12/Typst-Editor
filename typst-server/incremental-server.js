require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const http = require("http");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  path: "/ws", // 明确指定WebSocket路径
});

const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 在生产环境中服务前端静态文件
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../build")));
}

// 临时文件目录
const tempDir = path.join(__dirname, "temp");
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

// 编译缓存
const compilationCache = new Map();
const MAX_CACHE_SIZE = 100;

// 生成源代码的哈希
function generateSourceHash(source) {
  return crypto.createHash("md5").update(source).digest("hex");
}

// 清理旧缓存
function cleanupCache() {
  if (compilationCache.size > MAX_CACHE_SIZE) {
    const oldestKey = compilationCache.keys().next().value;
    compilationCache.delete(oldestKey);
  }
}

// WebSocket连接管理
const activeConnections = new Map();

wss.on("connection", (ws) => {
  const connectionId = crypto.randomUUID();
  console.log(`WebSocket连接建立: ${connectionId}`);

  activeConnections.set(connectionId, {
    ws,
    watchProcess: null,
    currentFile: null,
  });

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "compile") {
        await handleIncrementalCompile(
          connectionId,
          data.source,
          data.options || {},
        );
      } else if (data.type === "stop_watch") {
        stopWatch(connectionId);
      }
    } catch (error) {
      console.error("WebSocket消息处理错误:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          error: error.message,
        }),
      );
    }
  });

  ws.on("close", () => {
    console.log(`WebSocket连接关闭: ${connectionId}`);
    stopWatch(connectionId);
    activeConnections.delete(connectionId);
  });
});

// 增量编译处理
async function handleIncrementalCompile(connectionId, source, options) {
  const connection = activeConnections.get(connectionId);
  if (!connection) return;

  const { ws } = connection;

  // 检查缓存
  const sourceHash = generateSourceHash(source);
  if (compilationCache.has(sourceHash)) {
    const cached = compilationCache.get(sourceHash);
    ws.send(
      JSON.stringify({
        type: "compilation_result",
        success: true,
        data: cached,
        cached: true,
      }),
    );
    return;
  }

  try {
    // 停止之前的watch进程
    stopWatch(connectionId);

    // 生成临时文件
    const timestamp = Date.now();
    const inputFile = path.join(tempDir, `${connectionId}-${timestamp}.typ`);

    // 写入源代码
    fs.writeFileSync(inputFile, source, "utf8");
    connection.currentFile = inputFile;

    // 发送编译开始信号
    ws.send(
      JSON.stringify({
        type: "compilation_start",
      }),
    );

    // 使用较低的PPI以提高速度，根据选项决定格式
    const format = options.format || "svg"; // 默认使用SVG，更快
    const ppi = options.ppi || 300; // 降低PPI

    if (format === "svg") {
      // SVG编译（最快）
      await compileSVG(connectionId, inputFile, sourceHash);
    } else {
      // PNG编译
      await compilePNG(connectionId, inputFile, sourceHash, ppi);
    }
  } catch (error) {
    console.error("增量编译错误:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        error: error.message,
      }),
    );
  }
}

// SVG编译（推荐）
async function compileSVG(connectionId, inputFile, sourceHash) {
  const connection = activeConnections.get(connectionId);
  if (!connection) return;

  const { ws } = connection;
  const outputPattern = inputFile.replace(".typ", "-{p}.svg");

  const fontPaths = process.env.TYPST_FONT_PATHS;
  const fontFlag = fontPaths ? `--font-path "${fontPaths}"` : "";

  exec(
    `typst compile --format svg ${fontFlag} "${inputFile}" "${outputPattern}" --ignore-system-fonts`,
    (error, stdout, stderr) => {
      if (error) {
        console.error("SVG编译错误:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            error: `编译失败: ${stderr || error.message}`,
          }),
        );
        return;
      }

      // 查找生成的SVG文件
      const baseFileName = path.basename(inputFile, ".typ");
      const files = fs
        .readdirSync(tempDir)
        .filter(
          (file) =>
            file.startsWith(`${baseFileName}-`) && file.endsWith(".svg"),
        )
        .sort((a, b) => {
          // 按页码排序
          const aNum = parseInt(a.match(/-(\d+)\.svg$/)?.[1] || "0");
          const bNum = parseInt(b.match(/-(\d+)\.svg$/)?.[1] || "0");
          return aNum - bNum;
        });

      if (files.length > 0) {
        const pages = files.map((file, index) => {
          const filePath = path.join(tempDir, file);
          const svgContent = fs.readFileSync(filePath, "utf8");
          return {
            pageNumber: index + 1,
            data: svgContent,
          };
        });

        const result = {
          success: true,
          format: "svg",
          totalPages: pages.length,
          pages: pages,
        };

        // 缓存结果
        compilationCache.set(sourceHash, result);
        cleanupCache();

        ws.send(
          JSON.stringify({
            type: "compilation_result",
            ...result,
          }),
        );

        // 清理文件
        fs.unlinkSync(inputFile);
        files.forEach((file) => {
          fs.unlinkSync(path.join(tempDir, file));
        });
      } else {
        ws.send(
          JSON.stringify({
            type: "error",
            error: "编译完成但未找到输出文件",
          }),
        );
      }
    },
  );
}

// PNG编译（较慢）
async function compilePNG(connectionId, inputFile, sourceHash, ppi) {
  const connection = activeConnections.get(connectionId);
  if (!connection) return;

  const { ws } = connection;
  const outputFile = path.join(
    tempDir,
    `${path.basename(inputFile, ".typ")}-{p}.png`,
  );

  const fontPaths = process.env.TYPST_FONT_PATHS;
  const fontFlag = fontPaths ? `--font-path "${fontPaths}"` : "";

  exec(
    `typst compile --format png --ppi ${ppi} ${fontFlag} "${inputFile}" "${outputFile}" --ignore-system-fonts`,
    (error, stdout, stderr) => {
      if (error) {
        console.error("PNG编译错误:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            error: `编译失败: ${stderr || error.message}`,
          }),
        );
        return;
      }

      // 查找生成的PNG文件
      const baseFileName = path.basename(inputFile, ".typ");
      const files = fs
        .readdirSync(tempDir)
        .filter(
          (file) =>
            file.startsWith(`${baseFileName}-`) && file.endsWith(".png"),
        )
        .sort();

      if (files.length > 0) {
        const pages = files.map((file, index) => {
          const filePath = path.join(tempDir, file);
          const buffer = fs.readFileSync(filePath);
          return {
            pageNumber: index + 1,
            data: `data:image/png;base64,${buffer.toString("base64")}`,
          };
        });

        const result = {
          success: true,
          format: "png",
          totalPages: pages.length,
          pages: pages,
        };

        // 缓存结果
        compilationCache.set(sourceHash, result);
        cleanupCache();

        ws.send(
          JSON.stringify({
            type: "compilation_result",
            ...result,
          }),
        );

        // 清理文件
        fs.unlinkSync(inputFile);
        files.forEach((file) => {
          fs.unlinkSync(path.join(tempDir, file));
        });
      }
    },
  );
}

// 停止watch进程
function stopWatch(connectionId) {
  const connection = activeConnections.get(connectionId);
  if (!connection) return;

  if (connection.watchProcess) {
    connection.watchProcess.kill();
    connection.watchProcess = null;
  }
}

// 传统HTTP编译接口（向后兼容）
app.post("/compile", async (req, res) => {
  try {
    const { source, format = "png", ppi = 600 } = req.body;

    if (!source) {
      return res.status(400).json({ error: "缺少源代码" });
    }

    // 检查缓存
    const sourceHash = generateSourceHash(source);
    if (compilationCache.has(sourceHash)) {
      const cached = compilationCache.get(sourceHash);
      return res.json({
        ...cached,
        cached: true,
      });
    }

    // 生成临时文件
    const timestamp = Date.now();
    const inputFile = path.join(tempDir, `${timestamp}.typ`);

    // 写入源代码
    fs.writeFileSync(inputFile, source, "utf8");

    const fontPaths = process.env.TYPST_FONT_PATHS;
    const fontFlag = fontPaths ? `--font-path "${fontPaths}"` : "";

    if (format === "svg") {
      const outputFile = inputFile.replace(".typ", ".svg");

      exec(
        `typst compile --format svg ${fontFlag} "${inputFile}" "${outputFile}" --ignore-system-fonts`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("编译错误:", error);
            return res.status(400).json({
              error: `编译失败: ${stderr || error.message}`,
            });
          }

          if (fs.existsSync(outputFile)) {
            const svgContent = fs.readFileSync(outputFile, "utf8");

            const result = {
              success: true,
              format: "svg",
              content: svgContent,
              totalPages: 1,
              pages: [
                {
                  pageNumber: 1,
                  data: svgContent,
                },
              ],
            };

            // 缓存并返回
            compilationCache.set(sourceHash, result);
            cleanupCache();

            // 清理文件
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);

            res.json(result);
          } else {
            res.status(500).json({ error: "编译完成但未找到输出文件" });
          }
        },
      );
    } else {
      // PNG编译逻辑...（保留原有逻辑）
      const outputFile = path.join(tempDir, `${timestamp}-{p}.png`);

      exec(
        `typst compile --format png --ppi ${ppi} ${fontFlag} "${inputFile}" "${outputFile}" --ignore-system-fonts`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("编译错误:", error);
            return res.status(400).json({
              error: `编译失败: ${stderr || error.message}`,
            });
          }

          const files = fs
            .readdirSync(tempDir)
            .filter(
              (file) =>
                file.startsWith(`${timestamp}-`) && file.endsWith(".png"),
            )
            .sort();

          if (files.length > 0) {
            const pages = files.map((file, index) => {
              const filePath = path.join(tempDir, file);
              const buffer = fs.readFileSync(filePath);
              return {
                pageNumber: index + 1,
                data: `data:image/png;base64,${buffer.toString("base64")}`,
              };
            });

            const result = {
              success: true,
              format: "png",
              totalPages: pages.length,
              pages: pages,
            };

            // 缓存并返回
            compilationCache.set(sourceHash, result);
            cleanupCache();

            // 清理文件
            fs.unlinkSync(inputFile);
            files.forEach((file) => {
              fs.unlinkSync(path.join(tempDir, file));
            });

            res.json(result);
          } else {
            res.status(500).json({ error: "编译完成但未找到输出文件" });
          }
        },
      );
    }
  } catch (error) {
    console.error("服务器错误:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// 健康检查接口
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    cache_size: compilationCache.size,
    active_connections: activeConnections.size,
  });
});

// 功能列表接口
app.get("/features", (req, res) => {
  res.json({
    features: [
      "png_compilation",
      "svg_compilation",
      "syntax_highlighting",
      "error_reporting",
      "incremental_compilation",
      "websocket_support",
      "compilation_cache",
    ],
  });
});

// 在生产环境中，所有其他路由都返回前端应用
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Typst增量编译服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`WebSocket支持已启用`);
});
