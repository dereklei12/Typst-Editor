const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8080;

// 中间件
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 临时文件目录
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// 编译接口
app.post("/compile", async (req, res) => {
  try {
    const { source } = req.body;

    if (!source) {
      return res.status(400).json({ error: "缺少源代码" });
    }

    // 生成临时文件名
    const timestamp = Date.now();
    const inputFile = path.join(tempDir, `${timestamp}.typ`);
    const outputFile = path.join(tempDir, `${timestamp}-{p}.png`);

    // 写入源代码到临时文件
    fs.writeFileSync(inputFile, source, "utf8");

    // 执行Typst编译为PNG，使用600 PPI
    exec(
      `typst compile --format png --ppi 1200 "${inputFile}" "${outputFile}" --ignore-system-fonts`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("编译错误:", error);
          return res.status(400).json({
            error: `编译失败: ${stderr || error.message}`,
          });
        }

        // 查找生成的PNG文件
        const files = fs
          .readdirSync(tempDir)
          .filter(
            (file) => file.startsWith(`${timestamp}-`) && file.endsWith(".png"),
          )
          .sort(); // 按文件名排序确保页面顺序正确

        if (files.length > 0) {
          // 读取所有PNG文件并转换为base64
          const pages = files.map((file, index) => {
            const filePath = path.join(tempDir, file);
            const buffer = fs.readFileSync(filePath);
            return {
              pageNumber: index + 1,
              data: `data:image/png;base64,${buffer.toString("base64")}`,
            };
          });

          // 清理临时文件
          fs.unlinkSync(inputFile);
          files.forEach((file) => {
            fs.unlinkSync(path.join(tempDir, file));
          });

          // 返回JSON格式的多页数据
          res.json({
            success: true,
            totalPages: pages.length,
            pages: pages,
          });
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

// 健康检查接口
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 功能列表接口
app.get("/features", (req, res) => {
  res.json({
    features: ["png_compilation", "syntax_highlighting", "error_reporting"],
  });
});

app.listen(PORT, () => {
  console.log(`Typst服务器运行在 http://localhost:${PORT}`);
});
