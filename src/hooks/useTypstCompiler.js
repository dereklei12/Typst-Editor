import { useState, useEffect, useCallback, useRef } from "react";
import typstService from "../services/typstService";
import { generateFontSetting } from "../utils/fontUtils";

const useTypstCompiler = (source, options = {}) => {
  const [pngPages, setPngPages] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [isServerHealthy, setIsServerHealthy] = useState(false);

  // 防抖延迟，默认500ms
  const debounceDelay = options.debounceDelay || 500;
  const debounceTimer = useRef(null);
  const previousUrls = useRef([]);

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

  // 检查源代码是否已包含字体设置
  const hasFontSetting = (code) => {
    return /#set\s+text\s*\(\s*font:\s*\(/.test(code);
  };

  // 编译函数
  const compile = useCallback(
    async (sourceCode) => {
      if (!sourceCode.trim()) {
        setPngPages(null);
        setError(null);
        return;
      }

      if (!isServerHealthy) {
        setError("Typst服务器不可用");
        return;
      }

      setIsCompiling(true);
      setError(null);

      // 如果源代码没有字体设置，自动添加默认字体设置
      let finalSourceCode = sourceCode;
      if (!hasFontSetting(sourceCode)) {
        const defaultFontSetting = generateFontSetting();
        finalSourceCode = defaultFontSetting + "\n" + sourceCode;
      }

      try {
        const result = await typstService.compile(finalSourceCode);

        if (result.success && result.data) {
          // 清理之前的URLs
          previousUrls.current.forEach((url) => {
            if (url.startsWith("blob:")) {
              URL.revokeObjectURL(url);
            }
          });

          // 设置新的PNG页面数据 (base64格式直接使用，不需要创建blob URL)
          setPngPages({
            totalPages: result.data.totalPages,
            pages: result.data.pages,
          });
          // 记录当前URLs用于清理 (base64不需要清理，但保持一致性)
          previousUrls.current = result.data.pages.map((page) => page.data);
          setError(null);
        } else {
          setPngPages(null);
          setError(result.error || "编译失败");
        }
      } catch (err) {
        console.error("编译过程中出错:", err);
        setPngPages(null);
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

  // 组件卸载时清理URLs
  useEffect(() => {
    return () => {
      previousUrls.current.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
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
    pngPages,
    isCompiling,
    error,
    isServerHealthy,
    manualCompile,
  };
};

export default useTypstCompiler;
