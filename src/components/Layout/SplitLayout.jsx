import React, { useState, useCallback } from "react";
import TypstEditor from "../Editor/TypstEditor";
import TypstPreview from "../Preview/TypstPreview";
import useTypstCompiler from "../../hooks/useTypstCompiler";

const SplitLayout = () => {
  const [content, setContent] = useState(`= Typst文档示例

这是一个*粗体Bold*文本和_斜体Italic_文本的例子。

== 二级标题

你可以使用slash命令来快速插入格式：
- 输入 \`/bold\` 来插入粗体
- 输入 \`/italic\` 来插入斜体
- 输入 \`/heading\` 来插入标题

#align(center)[
  这是居中的文本
]

#pagebreak()

= 第二页示例

这是第二页的内容，用来测试多页SVG输出功能。

== 数学公式

$integral_0^1 x^2 d x = 1/3$

== 表格示例

#table(
  columns: 3,
  [名称], [年龄], [城市],
  [张三], [25], [北京],
  [李四], [30], [上海],
  [王五], [28], [广州],
)
`);

  const { pngPages, isCompiling, error } = useTypstCompiler(content, {
    debounceDelay: 300, // 减少防抖延迟以获得更快响应
  });

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 80px)",
        overflow: "hidden",
      }}
    >
      {/* 左侧编辑器 */}
      <div
        style={{
          width: "50%",
          borderRight: "1px solid #e1e5e9",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TypstEditor content={content} onChange={handleContentChange} />
      </div>

      {/* 右侧预览 */}
      <div
        style={{
          width: "50%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TypstPreview
          pngPages={pngPages}
          isCompiling={isCompiling}
          error={error}
          sourceCode={content}
        />
      </div>
    </div>
  );
};

export default SplitLayout;
