class WebSocketTypstService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageQueue = [];
    this.listeners = new Map();

    // WebSocket URL - 修正为正确的路径
    this.wsUrl =
      process.env.NODE_ENV === "production"
        ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`
        : "ws://localhost:8080/ws";

    this.connect();
  }

  connect() {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket连接已建立");
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // 发送队列中的消息
        this.flushMessageQueue();

        this.emit("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("WebSocket消息解析错误:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket连接已关闭");
        this.isConnected = false;
        this.emit("disconnected");

        // 自动重连
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket错误:", error);
        this.emit("error", error);
      };
    } catch (error) {
      console.error("WebSocket连接失败:", error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(
        `尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})，${delay}ms后重试`,
      );

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error("WebSocket重连失败，已达到最大重试次数");
      this.emit("reconnect_failed");
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case "compilation_start":
        this.emit("compilation_start");
        break;

      case "compilation_result":
        this.emit("compilation_result", data);
        break;

      case "error":
        this.emit("compilation_error", data.error);
        break;

      default:
        console.warn("未知的消息类型:", data.type);
    }
  }

  // 发送编译请求
  compile(source, options = {}) {
    const message = {
      type: "compile",
      source,
      options: {
        format: "svg", // 默认使用SVG格式，更快
        ppi: 300,
        ...options,
      },
    };

    this.send(message);
  }

  // 停止当前编译
  stopCompilation() {
    this.send({
      type: "stop_watch",
    });
  }

  send(message) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // 连接未就绪，加入队列
      this.messageQueue.push(message);
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  // 事件监听器
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`事件监听器错误 (${event}):`, error);
        }
      });
    }
  }

  // 关闭连接
  close() {
    if (this.ws) {
      this.ws.close();
    }
  }

  // 检查连接状态
  isReady() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// 创建单例实例
const websocketTypstService = new WebSocketTypstService();

export default websocketTypstService;
