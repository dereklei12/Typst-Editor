# Typst 所见即所得编辑器

一个基于React的Typst文档编辑器，支持实时预览和丰富的编辑功能。

## 功能特性

- 🖋️ **富文本编辑**: 基于Tiptap的强大编辑器
- ⚡ **实时预览**: 左侧编辑，右侧实时显示PDF预览
- 🎯 **Slash命令**: 输入`/`快速插入格式和元素
- 🎨 **工具栏**: 直观的格式化工具栏
- 📝 **语法支持**: 完整的Typst语法支持
- 🔄 **自动保存**: 实时同步编辑内容

## 快速开始

### 前置要求

- Node.js 16+
- npm或yarn
- Typst编译服务器（后端）

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 环境配置

创建`.env`文件：

\`\`\`
REACT_APP_TYPST_SERVER_URL=http://localhost:8080
\`\`\`

### 启动开发服务器

\`\`\`bash
npm start
\`\`\`

## 使用说明

### 编辑器功能

1. **工具栏**: 点击工具栏按钮快速格式化文本
2. **Slash命令**: 在编辑器中输入`/`调出命令面板
3. **快捷键**:
   - `Ctrl+B`: 加粗
   - `Ctrl+I`: 斜体
   - `Ctrl+U`: 下划线

### Slash命令

- `/bold` - 加粗文本
- `/italic` - 斜体文本
- `/heading1` - 一级标题
- `/heading2` - 二级标题
- `/heading3` - 三级标题
- `/bulletList` - 无序列表
- `/orderedList` - 有序列表


### Typst语法示例

\`\`\`typst
= 文档标题

这是一个*粗体*文本和_斜体_文本的例子。

== 二级标题

- 无序列表项1
- 无序列表项2

1. 有序列表项1
2. 有序列表项2



## 后端服务器

此编辑器需要一个Typst编译服务器。服务器应提供以下API：

### API接口

- `POST /compile` - 编译Typst源码
- `GET /health` - 健康检查
- `GET /features` - 获取支持的功能

### 示例后端实现

可以使用以下技术栈创建后端服务器：

- **Node.js + Express**: 使用`@typst/ts-node`
- **Python + FastAPI**: 使用`typst-py`
- **Rust + Actix**: 直接使用Typst编译器
- **Go + Gin**: 通过CLI调用Typst

## 项目结构

\`\`\`
src/
├── components/
│   ├── Editor/           # 编辑器组件
│   ├── Preview/          # 预览组件
│   └── Layout/           # 布局组件
├── services/             # API服务
├── hooks/                # React Hooks
├── utils/                # 工具函数
└── App.jsx              # 主应用组件
\`\`\`

## 开发计划

- [ ] 语法高亮
- [ ] 自动完成
- [ ] 文档大纲
- [ ] 主题切换
- [ ] 导出功能
- [ ] 协同编辑
- [ ] 插件系统

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License
