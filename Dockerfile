# 使用官方Node.js运行时作为基础镜像
FROM node:18-slim

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    ca-certificates \
    gnupg \
    lsb-release \
    unzip \
    xz-utils \
    fonts-liberation \
    fonts-dejavu-core \
    fontconfig \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 安装Typst编译器
RUN curl -L https://github.com/typst/typst/releases/latest/download/typst-x86_64-unknown-linux-musl.tar.xz \
    -o /tmp/typst.tar.xz && \
    tar -xJ -C /usr/local/bin --strip-components=1 -f /tmp/typst.tar.xz && \
    rm /tmp/typst.tar.xz && \
    chmod +x /usr/local/bin/typst

# 安装Puppeteer依赖
RUN apt-get update && apt-get install -y \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 设置Puppeteer使用系统chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 设置工作目录
WORKDIR /app

# 复制前端项目文件
COPY package*.json ./
COPY src/ ./src/
COPY public/ ./public/

# 安装前端依赖并构建
RUN npm install
RUN npm run build

# 复制后端项目文件
COPY typst-server/ ./typst-server/

# 安装后端依赖
WORKDIR /app/typst-server
RUN npm install && npm audit fix --force

# 复制字体文件
COPY fonts/ /app/fonts/

# 创建临时文件目录
RUN mkdir -p /app/typst-server/temp

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8080
ENV TYPST_FONT_PATHS=/app/fonts

# 暴露端口
EXPOSE 8080

# 确保工作目录是typst-server
WORKDIR /app/typst-server

# 启动简化的SVG编译服务
CMD ["node", "simple-svg-server.js"]
