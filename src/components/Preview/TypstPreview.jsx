import React from "react";
import { FileText, AlertCircle, Loader2 } from "lucide-react";

const TypstPreview = ({ pdfUrl, isCompiling, error }) => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* 预览区域标题 */}
      <div
        style={{
          padding: "1rem",
          borderBottom: "1px solid #e1e5e9",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <FileText size={16} />
        <span style={{ fontWeight: "500" }}>预览</span>
        {isCompiling && (
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <Loader2
              size={14}
              style={{ animation: "spin 1s linear infinite" }}
            />
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              编译中...
            </span>
          </div>
        )}
      </div>

      {/* 预览内容 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        {error ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              color: "#dc2626",
              textAlign: "center",
            }}
          >
            <AlertCircle size={48} />
            <div>
              <h3 style={{ marginBottom: "0.5rem" }}>编译错误</h3>
              <p style={{ fontSize: "0.875rem" }}>{error}</p>
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "white",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            title="Typst预览"
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            <FileText size={48} />
            <div>
              <h3 style={{ marginBottom: "0.5rem" }}>开始编写你的文档</h3>
              <p style={{ fontSize: "0.875rem" }}>
                在左侧编辑器中输入内容，预览将自动显示在这里
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 添加旋转动画的CSS
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default TypstPreview;
