import axios from "axios";

class TypstService {
  constructor() {
    // Typst服务器的基础URL，可以根据实际情况修改
    // 在生产环境中使用相对路径，这样会自动使用当前域名
    this.baseURL =
      process.env.NODE_ENV === "production"
        ? "" // 生产环境使用相对路径
        : process.env.REACT_APP_TYPST_SERVER_URL || "http://localhost:8080";
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30秒超时
    });
  }

  /**
   * 编译Typst源码为PNG
   * @param {string} source - Typst源码
   * @returns {Promise<{success: boolean, data?: {totalPages: number, pages: Array}, error?: string}>}
   */
  async compile(source) {
    try {
      const response = await this.api.post(
        "/compile",
        {
          source,
          format: "png",
        },
        {
          responseType: "json", // 期望返回JSON数据
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.data.error || "编译失败",
        };
      }
    } catch (error) {
      console.error("Typst编译错误:", error);

      if (error.response) {
        // 服务器返回了错误响应
        return {
          success: false,
          error:
            error.response.data?.message ||
            `服务器错误: ${error.response.status}`,
        };
      } else if (error.request) {
        // 请求发出但没有收到响应
        return {
          success: false,
          error: "无法连接到Typst服务器，请检查服务器是否运行",
        };
      } else {
        // 其他错误
        return {
          success: false,
          error: error.message || "编译过程中发生未知错误",
        };
      }
    }
  }

  /**
   * 检查服务器状态
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    try {
      const response = await this.api.get("/health");
      return response.status === 200;
    } catch (error) {
      console.error("健康检查失败:", error);
      return false;
    }
  }

  /**
   * 获取支持的功能列表
   * @returns {Promise<Array<string>>}
   */
  async getSupportedFeatures() {
    try {
      const response = await this.api.get("/features");
      return response.data.features || [];
    } catch (error) {
      console.error("获取功能列表失败:", error);
      return [];
    }
  }
}

// 创建单例实例
const typstService = new TypstService();

export default typstService;
