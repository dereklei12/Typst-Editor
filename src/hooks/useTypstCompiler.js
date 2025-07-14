import { useState, useEffect, useCallback, useRef } from "react";
import typstService from "../services/typstService";

const useTypstCompiler = (source, options = {}) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [isServerHealthy, setIsServerHealthy] = useState(false);

  // 防抖延迟，默认500ms
  const debounceDelay = options.debounceDelay || 500;
  const debounceTimer = useRef(null);
  const previousUrl = useRef(null);

  // 检查服务器健康状态
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await typstService.checkHealth();
      setIsServerHealthy(healthy);
      if (!healthy) {
        setError("Typst服务器未响应，请确保服务器正在运行");
      }
    };

    checkHealth();
    // 每30秒检查一次服务器状态
    const healthInterval = setInterval(checkHealth, 30000);

    return () => clearInterval(healthInterval);
  }, []);

  // 编译函数
  const compile = useCallback(
    async (sourceCode) => {
      if (!sourceCode.trim()) {
        setPdfUrl(null);
        setError(null);
        return;
      }

      if (!isServerHealthy) {
        setError("Typst服务器不可用");
        return;
      }

      setIsCompiling(true);
      setError(null);

      try {
        const result = await typstService.compile(sourceCode);

        if (result.success && result.data) {
          // 清理之前的URL
          if (previousUrl.current) {
            URL.revokeObjectURL(previousUrl.current);
          }

          // 创建新的PDF URL
          const newUrl = URL.createObjectURL(result.data);
          setPdfUrl(newUrl);
          previousUrl.current = newUrl;
          setError(null);
        } else {
          setPdfUrl(null);
          setError(result.error || "编译失败");
        }
      } catch (err) {
        console.error("编译过程中出错:", err);
        setPdfUrl(null);
        setError("编译过程中发生错误: " + err.message);
      } finally {
        setIsCompiling(false);
      }
    },
    [isServerHealthy],
  );

  // 防抖编译
  const debouncedCompile = useCallback(
    (sourceCode) => {
      // 清除之前的定时器
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // 设置新的定时器
      debounceTimer.current = setTimeout(() => {
        compile(sourceCode);
      }, debounceDelay);
    },
    [compile, debounceDelay],
  );

  // 监听源码变化并触发编译
  useEffect(() => {
    if (source && isServerHealthy) {
      debouncedCompile(source);
    }

    // 清理函数
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [source, debouncedCompile, isServerHealthy]);

  // 组件卸载时清理URL
  useEffect(() => {
    return () => {
      if (previousUrl.current) {
        URL.revokeObjectURL(previousUrl.current);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // 手动触发编译
  const manualCompile = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    compile(source);
  }, [compile, source]);

  return {
    pdfUrl,
    isCompiling,
    error,
    isServerHealthy,
    manualCompile,
  };
};

export default useTypstCompiler;
