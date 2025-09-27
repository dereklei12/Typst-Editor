import React from "react";
import { Settings, Zap, Image, FileImage } from "lucide-react";

const CompilationSettings = ({
  format,
  onFormatChange,
  useWebSocket,
  isServerHealthy,
  cacheHit
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 1rem",
        borderBottom: "1px solid #e1e5e9",
        backgroundColor: "#f8f9fa",
        fontSize: "0.875rem"
      }}
    >
      <Settings size={14} />
      <span style={{ fontWeight: "500" }}>编译设置:</span>

      {/* 格式选择 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span>格式:</span>
        <div
          style={{
            display: "flex",
            backgroundColor: "white",
            borderRadius: "0.375rem",
            border: "1px solid #d1d5db",
            overflow: "hidden"
          }}
        >
          <button
            onClick={() => onFormatChange('svg')}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.5rem",
              border: "none",
              backgroundColor: format === 'svg' ? '#3b82f6' : 'white',
              color: format === 'svg' ? 'white' : '#374151',
              fontSize: "0.75rem",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            <Image size={12} />
            SVG
            {format === 'svg' && (
              <span style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "0.125rem 0.25rem",
                borderRadius: "0.25rem",
                fontSize: "0.625rem"
              }}>
                快速
              </span>
            )}
          </button>
          <button
            onClick={() => onFormatChange('png')}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.5rem",
              border: "none",
              backgroundColor: format === 'png' ? '#3b82f6' : 'white',
              color: format === 'png' ? 'white' : '#374151',
              fontSize: "0.75rem",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            <FileImage size={12} />
            PNG
            {format === 'png' && (
              <span style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "0.125rem 0.25rem",
                borderRadius: "0.25rem",
                fontSize: "0.625rem"
              }}>
                高清
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 连接状态 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: isServerHealthy
              ? (useWebSocket ? "#10b981" : "#f59e0b")
              : "#ef4444"
          }}
        />
        <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>
          {!isServerHealthy
            ? "离线"
            : useWebSocket
              ? "实时连接"
              : "HTTP模式"
          }
        </span>
      </div>

      {/* 缓存状态 */}
      {cacheHit && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Zap size={12} style={{ color: "#f59e0b" }} />
          <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>
            缓存命中
          </span>
        </div>
      )}

      {/* 性能提示 */}
      <div style={{
        marginLeft: "auto",
        fontSize: "0.75rem",
        color: "#6b7280",
        fontStyle: "italic"
      }}>
        {format === 'svg'
          ? "SVG模式: 编译更快，适合实时预览"
          : "PNG模式: 高分辨率，适合最终输出"
        }
      </div>
    </div>
  );
};

export default CompilationSettings;
