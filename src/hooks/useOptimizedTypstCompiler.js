import { useState, useEffect, useCallback, useRef } from "react";
import websocketTypstService from "../services/websocketTypstService";
import typstService from "../services/typstService"; // 作为后备
import { generateFontSetting } from "../utils/fontUtils";

const useOptimizedTypstCompiler = (source, options = {}) => {
  const [compilationData, setCompilationData] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [isServerHealthy, setIsServerHealthy] = useState(false);
  const [useWebSocket, setUseWebSocket] = useState(true);
  const [cacheHit, setCacheHit] = useState(false);

  // 配置选项
  const debounceDelay = options.debounceDelay || 300; // 减少延迟
  const format = options.format || "svg"; // 默认SVG格式
  const enableCache = options.enableCache !== false; // 默认启用缓存

  const debounceTimer = useRef(null);
  const lastCompiledSource = useRef("");
  const compilationAbortController = useRef(null);

  // WebSocket事件处理
  useEffect(() => {
    const handleCompilationStart = () => {
      setIsCompiling(true);
      setError(null);
      setCacheHit(false);
    };

    const handleCompilationResult = (data) => {
      setIsCompiling(false);

      if (data.success) {
        setCompilationData(data);
        setError(null);
        setCacheHit(data.cached || false);
      } else {
        setError(data.error || "编译失败");
        setCompilationData(null);
      }
    };

    const handleCompilationError = (errorMessage) => {
      setIsCompiling(false);
      setError(errorMessage);
      setCompilationData(null);
    };

    const handleConnected = () => {
      setIsServerHealthy(true);
      console.log("WebSocket编译服务已连接");
    };

    const handleDisconnected = () => {
      setIsServerHealthy(false);
      console.log("WebSocket编译服务已断开");
    };

    const handleReconnectFailed = () => {
      setUseWebSocket(false);
      setIsServerHealthy(false);
      console.log("WebSocket重连失败，切换到HTTP模式");
    };

    // 注册事件监听器
    websocketTypstService.on("compilation_start", handleCompilationStart);
    websocketTypstService.on("compilation_result", handleCompilationResult);
    websocketTypstService.on("compilation_error", handleCompilationError);
    websocketTypstService.on("connected", handleConnected);
    websocketTypstService.on("disconnected", handleDisconnected);
    websocketTypstService.on("reconnect_failed", handleReconnectFailed);

    // 初始健康检查
    if (websocketTypstService.isReady()) {
      setIsServerHealthy(true);
    } else {
      // 后备HTTP健康检查
      checkHttpHealth();
    }

    return () => {
      // 清理事件监听器
      websocketTypstService.off("compilation_start", handleCompilationStart);
      websocketTypstService.off("compilation_result", handleCompilationResult);
      websocketTypstService.off("compilation_error", handleCompilationError);
      websocketTypstService.off("connected", handleConnected);
      websocketTypstService.off("disconnected", handleDisconnected);
      websocketTypstService.off("reconnect_failed", handleReconnectFailed);
    };
  }, []);

  // HTTP健康检查
  const checkHttpHealth = async () => {
    try {
      const healthy = await typstService.checkHealth();
      setIsServerHealthy(healthy);
      if (!healthy) {
        setError("编译服务器未响应，请检查服务器状态");
      }
    } catch (error) {
      console.error("健康检查失败:", error);
      setIsServerHealthy(false);
    }
  };

  // 检查源代码是否包含字体设置
  const hasFontSetting = (code) => {
    return /#set\s+text\s*\(\s*font:\s*\(/.test(code);
  };

  // WebSocket编译
  const compileWithWebSocket = useCallback(
    async (sourceCode) => {
      if (!hasFontSetting(sourceCode)) {
        const defaultFontSetting = generateFontSetting();
        sourceCode = defaultFontSetting + "\n" + sourceCode;
      }

      websocketTypstService.compile(sourceCode, {
        format,
        ppi: format === "png" ? 300 : undefined, // PNG时使用较低PPI
        enableCache,
      });
    },
    [format, enableCache],
  );

  // HTTP编译（后备方案）
  const compileWithHttp = useCallback(
    async (sourceCode) => {
      if (!hasFontSetting(sourceCode)) {
        const defaultFontSetting = generateFontSetting();
        sourceCode = defaultFontSetting + "\n" + sourceCode;
      }

      setIsCompiling(true);
      setError(null);

      try {
        // 取消之前的请求
        if (compilationAbortController.current) {
          compilationAbortController.current.abort();
        }

        compilationAbortController.current = new AbortController();

        const result = await typstService.compile(sourceCode);

        if (result.success) {
          setCompilationData(result.data);
          setError(null);
          setCacheHit(result.cached || false);
        } else {
          setError(result.error || "编译失败");
          setCompilationData(null);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("HTTP编译错误:", error);
          setError("编译过程中发生错误: " + error.message);
          setCompilationData(null);
        }
      } finally {
        setIsCompiling(false);
      }
    },
    [format],
  );

  // 统一编译函数
  const compile = useCallback(
    async (sourceCode) => {
      if (!sourceCode.trim()) {
        setCompilationData(null);
        setError(null);
        return;
      }

      if (!isServerHealthy) {
        setError("编译服务器不可用");
        return;
      }

      // 检查是否需要重新编译
      if (sourceCode === lastCompiledSource.current && compilationData) {
        console.log("源代码未改变，跳过编译");
        return;
      }

      lastCompiledSource.current = sourceCode;

      try {
        if (useWebSocket && websocketTypstService.isReady()) {
          await compileWithWebSocket(sourceCode);
        } else {
          await compileWithHttp(sourceCode);
        }
      } catch (error) {
        console.error("编译错误:", error);
        setError("编译失败: " + error.message);
      }
    },
    [
      isServerHealthy,
      useWebSocket,
      compileWithWebSocket,
      compileWithHttp,
      compilationData,
    ],
  );

  // 防抖编译
  const debouncedCompile = useCallback(
    (sourceCode) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        compile(sourceCode);
      }, debounceDelay);
    },
    [compile, debounceDelay],
  );

  // 监听源码变化
  useEffect(() => {
    if (source && isServerHealthy) {
      debouncedCompile(source);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [source, debouncedCompile, isServerHealthy]);

  // 清理
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (compilationAbortController.current) {
        compilationAbortController.current.abort();
      }
    };
  }, []);

  // 手动编译
  const manualCompile = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (source) {
      compile(source);
    }
  }, [compile, source]);

  // 停止编译
  const stopCompilation = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (useWebSocket && websocketTypstService.isReady()) {
      websocketTypstService.stopCompilation();
    }

    if (compilationAbortController.current) {
      compilationAbortController.current.abort();
    }

    setIsCompiling(false);
  }, [useWebSocket]);

  return {
    // 保持向后兼容性
    pngPages: compilationData,
    compilationData, // 新的更通用的字段
    isCompiling,
    error,
    isServerHealthy,
    manualCompile,
    stopCompilation,
    // 新增的状态
    useWebSocket,
    cacheHit,
    format,
  };
};

export default useOptimizedTypstCompiler;
