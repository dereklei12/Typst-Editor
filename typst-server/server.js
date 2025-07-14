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
    const outputFile = path.join(tempDir, `${timestamp}.pdf`);

    // 写入源代码到临时文件
    fs.writeFileSync(inputFile, source, "utf8");

    // 执行Typst编译
    exec(
      `typst compile "${inputFile}" "${outputFile}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("编译错误:", error);
          return res.status(400).json({
            error: `编译失败: ${stderr || error.message}`,
          });
        }

        // 读取编译后的PDF文件
        if (fs.existsSync(outputFile)) {
          const pdfBuffer = fs.readFileSync(outputFile);

          // 清理临时文件
          fs.unlinkSync(inputFile);
          fs.unlinkSync(outputFile);

          // 返回PDF文件
          res.set({
            "Content-Type": "application/pdf",
            "Content-Length": pdfBuffer.length,
          });
          res.send(pdfBuffer);
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
    features: ["pdf_compilation", "syntax_highlighting", "error_reporting"],
  });
});

app.listen(PORT, () => {
  console.log(`Typst服务器运行在 http://localhost:${PORT}`);
});
