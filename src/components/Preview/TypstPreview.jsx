import React, { useState, useCallback } from "react";
import {
  FileText,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Download,
} from "lucide-react";
import typstService from "../../services/typstService";

const TypstPreview = ({ pngPages, isCompiling, error, sourceCode }) => {
  // 支持SVG格式的编译数据
  const compilationData = pngPages;

  // 缩放控制状态
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fitToWidth, setFitToWidth] = useState(true);

  // 下载状态
  const [isDownloading, setIsDownloading] = useState(false);

  // 缩放控制函数
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev * 1.2, 3));
    setFitToWidth(false);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev / 1.2, 0.3));
    setFitToWidth(false);
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setFitToWidth(true);
  }, []);

  const handleFitToWidth = useCallback(() => {
    setFitToWidth(!fitToWidth);
    if (!fitToWidth) {
      setZoomLevel(1);
    }
  }, [fitToWidth]);

  // 下载PDF处理函数
  const handleDownloadPDF = useCallback(async () => {
    if (!sourceCode || isDownloading) return;

    setIsDownloading(true);
    try {
      const result = await typstService.downloadPDF(sourceCode);
      if (!result.success) {
        alert(`下载失败: ${result.error}`);
      }
    } catch (error) {
      console.error("下载PDF失败:", error);
      alert("下载失败，请稍后重试");
    } finally {
      setIsDownloading(false);
    }
  }, [sourceCode, isDownloading]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* 预览区域标题和控制栏 */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #e1e5e9",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FileText size={16} />
          <span style={{ fontWeight: "500" }}>
            SVG预览
            {compilationData &&
              compilationData.totalPages &&
              ` (${compilationData.totalPages}页)`}
          </span>
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

          {/* 下载PDF按钮 */}
          {compilationData && compilationData.pages && sourceCode && (
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading || isCompiling}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem",
                padding: "0.375rem 0.75rem",
                border: "none",
                backgroundColor:
                  isDownloading || isCompiling ? "#e5e7eb" : "#3b82f6",
                borderRadius: "0.375rem",
                cursor:
                  isDownloading || isCompiling ? "not-allowed" : "pointer",
                color: isDownloading || isCompiling ? "#9ca3af" : "white",
                fontSize: "0.75rem",
                fontWeight: "500",
                transition: "all 0.15s",
              }}
              title="下载PDF"
            >
              {isDownloading ? (
                <>
                  <Loader2
                    size={12}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  下载中...
                </>
              ) : (
                <>
                  <Download size={12} />
                  下载PDF
                </>
              )}
            </button>
          )}
        </div>

        {/* 缩放控制按钮 */}
        {compilationData && compilationData.pages && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              backgroundColor: "#f3f4f6",
              borderRadius: "0.375rem",
              padding: "0.25rem",
            }}
          >
            <button
              onClick={handleZoomOut}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                border: "none",
                backgroundColor: zoomLevel <= 0.3 ? "#e5e7eb" : "white",
                borderRadius: "0.25rem",
                cursor: zoomLevel <= 0.3 ? "not-allowed" : "pointer",
                color: zoomLevel <= 0.3 ? "#9ca3af" : "#374151",
                transition: "all 0.15s",
              }}
              disabled={zoomLevel <= 0.3}
              title="缩小"
            >
              <ZoomOut size={14} />
            </button>

            <span
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                minWidth: "50px",
                textAlign: "center",
              }}
            >
              {fitToWidth ? "适应" : `${Math.round(zoomLevel * 100)}%`}
            </span>

            <button
              onClick={handleZoomIn}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                border: "none",
                backgroundColor: zoomLevel >= 3 ? "#e5e7eb" : "white",
                borderRadius: "0.25rem",
                cursor: zoomLevel >= 3 ? "not-allowed" : "pointer",
                color: zoomLevel >= 3 ? "#9ca3af" : "#374151",
                transition: "all 0.15s",
              }}
              disabled={zoomLevel >= 3}
              title="放大"
            >
              <ZoomIn size={14} />
            </button>

            <button
              onClick={handleFitToWidth}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                border: "none",
                backgroundColor: fitToWidth ? "#3b82f6" : "white",
                borderRadius: "0.25rem",
                cursor: "pointer",
                color: fitToWidth ? "white" : "#374151",
                transition: "all 0.15s",
              }}
              title="适应宽度"
            >
              <Maximize2 size={14} />
            </button>

            <button
              onClick={handleResetZoom}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                border: "none",
                backgroundColor: "white",
                borderRadius: "0.25rem",
                cursor: "pointer",
                color: "#374151",
                transition: "all 0.15s",
              }}
              title="重置缩放"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>

      {/* 预览内容 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#f3f4f6",
        }}
      >
        {error ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "1rem",
              color: "#dc2626",
              textAlign: "center",
              padding: "1rem",
            }}
          >
            <AlertCircle size={48} />
            <div>
              <h3 style={{ marginBottom: "0.5rem" }}>编译错误</h3>
              <p style={{ fontSize: "0.875rem" }}>{error}</p>
            </div>
          </div>
        ) : compilationData && compilationData.pages ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              overflowY: "auto",
              overflowX: fitToWidth ? "hidden" : "auto",
              height: "100%",
              padding: "1rem",
              alignItems: "center",
            }}
          >
            {compilationData.pages.map((page, index) => (
              <div
                key={page.pageNumber}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  maxWidth: fitToWidth ? "100%" : "none",
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e5e7eb",
                    overflow: fitToWidth ? "hidden" : "visible",
                    maxWidth: fitToWidth ? "100%" : "none",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: fitToWidth ? "1rem" : "0.5rem",
                    minHeight: "200px",
                  }}
                >
                  <div
                    className="svg-container"
                    style={{
                      transform: fitToWidth ? "none" : `scale(${zoomLevel})`,
                      transformOrigin: "center center",
                      transition: "transform 0.2s ease-in-out",
                      lineHeight: 0,
                      width: fitToWidth ? "100%" : "auto",
                      height: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    dangerouslySetInnerHTML={{ __html: page.data }}
                  />
                </div>

                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    fontWeight: "500",
                    backgroundColor: "white",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  第 {page.pageNumber} 页
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "1rem",
              color: "#6b7280",
              textAlign: "center",
              padding: "1rem",
            }}
          >
            <FileText size={48} />
            <div>
              <h3 style={{ marginBottom: "0.5rem" }}>开始编写你的文档</h3>
              <p style={{ fontSize: "0.875rem" }}>
                在左侧编辑器中输入内容，SVG预览将自动显示在这里
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 添加样式优化
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* 优化SVG显示 */
  .svg-container svg {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }

  /* 适应宽度时的SVG样式 */
  .svg-container svg.fit-width {
    width: 100%;
    height: auto;
  }

  /* 平滑滚动条样式 */
  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  *::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  *::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    transition: background 0.2s ease;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* 响应式缩放按钮 */
  @media (max-width: 640px) {
    .zoom-controls {
      flex-wrap: wrap;
      gap: 0.125rem;
    }

    .zoom-controls button {
      width: 24px;
      height: 24px;
    }

    .zoom-controls span {
      font-size: 0.625rem;
      min-width: 40px;
    }
  }
`;
document.head.appendChild(style);

export default TypstPreview;
