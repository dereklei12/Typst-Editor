require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
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
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
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

// PDF下载接口
app.post("/download-pdf", async (req, res) => {
  try {
    const { source } = req.body;

    if (!source) {
      return res.status(400).json({ error: "缺少源代码" });
    }

    // 生成临时文件
    const timestamp = Date.now();
    const inputFile = path.join(tempDir, `${timestamp}.typ`);
    const outputFile = path.join(tempDir, `${timestamp}.pdf`);

    // 写入源代码
    fs.writeFileSync(inputFile, source, "utf8");

    const fontPaths = process.env.TYPST_FONT_PATHS;
    const fontFlag = fontPaths ? `--font-path "${fontPaths}"` : "";

    exec(
      `typst compile --format pdf ${fontFlag} "${inputFile}" "${outputFile}" --ignore-system-fonts`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("PDF编译错误:", error);
          return res.status(400).json({
            error: `PDF编译失败: ${stderr || error.message}`,
          });
        }

        if (fs.existsSync(outputFile)) {
          // 设置响应头for PDF下载
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            'attachment; filename="document.pdf"',
          );

          // 创建文件流并发送
          const fileStream = fs.createReadStream(outputFile);
          fileStream.pipe(res);

          // 在发送完成后清理文件
          fileStream.on("end", () => {
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);
          });

          fileStream.on("error", (err) => {
            console.error("文件流错误:", err);
            fs.unlinkSync(inputFile);
            if (fs.existsSync(outputFile)) {
              fs.unlinkSync(outputFile);
            }
            if (!res.headersSent) {
              res.status(500).json({ error: "文件下载失败" });
            }
          });
        } else {
          res.status(500).json({ error: "PDF编译完成但未找到输出文件" });
        }
      },
    );
  } catch (error) {
    console.error("PDF下载服务器错误:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// 简化的SVG编译接口
app.post("/compile", async (req, res) => {
  try {
    const { source } = req.body;

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
    const outputPattern = inputFile.replace(".typ", "-{p}.svg");

    // 写入源代码
    fs.writeFileSync(inputFile, source, "utf8");

    const fontPaths = process.env.TYPST_FONT_PATHS;
    const fontFlag = fontPaths ? `--font-path "${fontPaths}"` : "";

    exec(
      `typst compile --format svg ${fontFlag} "${inputFile}" "${outputPattern}" --ignore-system-fonts`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("SVG编译错误:", error);
          return res.status(400).json({
            error: `编译失败: ${stderr || error.message}`,
          });
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
  } catch (error) {
    console.error("服务器错误:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// Firebase配置接口
app.get("/api/firebase-config", (req, res) => {
  const firebaseConfigPath = path.join(__dirname, "../firebase-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
    res.json(config);
  } else {
    res.status(404).json({ error: "Firebase config not found" });
  }
});

// 健康检查接口
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    cache_size: compilationCache.size,
    format: "svg_only",
  });
});

// 功能列表接口
app.get("/features", (req, res) => {
  res.json({
    features: [
      "svg_compilation",
      "pdf_download",
      "syntax_highlighting",
      "error_reporting",
      "compilation_cache",
      "multi_page_support",
    ],
  });
});

// 在生产环境中，所有其他路由都返回前端应用
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Typst SVG编译服务器运行在 http://0.0.0.0:${PORT}`);
  console.log(`仅支持SVG格式，支持多页输出和缓存`);
});
