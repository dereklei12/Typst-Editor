/**
 * 将Typst标记转换为HTML（用于编辑器显示）
 * @param {string} typstContent - Typst格式的内容
 * @returns {string} HTML格式的内容
 */
export const typstToHtml = (typstContent) => {
  if (!typstContent) return "";

  let html = typstContent;

  // 辅助函数：处理带对齐的标题转换
  const processAlignedHeadings = (html) => {
    // 处理一级标题对齐
    html = html.replace(
      /#align\(center\)\[= (.+)\]/g,
      '<h1 style="text-align: center">$1</h1>',
    );
    html = html.replace(
      /#align\(right\)\[= (.+)\]/g,
      '<h1 style="text-align: right">$1</h1>',
    );
    html = html.replace(
      /#align\(left\)\[= (.+)\]/g,
      '<h1 style="text-align: left">$1</h1>',
    );

    // 处理二级标题对齐
    html = html.replace(
      /#align\(center\)\[== (.+)\]/g,
      '<h2 style="text-align: center">$1</h2>',
    );
    html = html.replace(
      /#align\(right\)\[== (.+)\]/g,
      '<h2 style="text-align: right">$1</h2>',
    );
    html = html.replace(
      /#align\(left\)\[== (.+)\]/g,
      '<h2 style="text-align: left">$1</h2>',
    );

    // 处理三级标题对齐
    html = html.replace(
      /#align\(center\)\[=== (.+)\]/g,
      '<h3 style="text-align: center">$1</h3>',
    );
    html = html.replace(
      /#align\(right\)\[=== (.+)\]/g,
      '<h3 style="text-align: right">$1</h3>',
    );
    html = html.replace(
      /#align\(left\)\[=== (.+)\]/g,
      '<h3 style="text-align: left">$1</h3>',
    );

    return html;
  };

  // 首先处理带对齐的标题
  html = processAlignedHeadings(html);

  // 然后处理普通标题
  html = html.replace(/^= (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/^== (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^=== (.+)$/gm, "<h3>$1</h3>");

  // 转换对齐语法
  html = html.replace(
    /#align\(center\)\[([^\]]+)\]/g,
    '<p style="text-align: center">$1</p>',
  );
  html = html.replace(
    /#align\(right\)\[([^\]]+)\]/g,
    '<p style="text-align: right">$1</p>',
  );
  html = html.replace(
    /#align\(left\)\[([^\]]+)\]/g,
    '<p style="text-align: left">$1</p>',
  );

  // 转换粗体和斜体
  html = html.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

  // 转换列表项
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>");

  // 包装连续的列表项
  html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
    const items = match.split("</li>").filter((item) => item.trim());
    if (items.length > 0) {
      const wrappedItems = items.map((item) => item + "</li>").join("");
      return `<ul>${wrappedItems}</ul>`;
    }
    return match;
  });

  // 转换段落
  html = html.replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";

  // 清理空段落
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>\s*<h/g, "<h");
  html = html.replace(/<\/h(\d)>\s*<\/p>/g, "</h$1>");
  html = html.replace(/<p>\s*<ul>/g, "<ul>");
  html = html.replace(/<\/ul>\s*<\/p>/g, "</ul>");
  html = html.replace(/<p>\s*<pre>/g, "<pre>");
  html = html.replace(/<\/pre>\s*<\/p>/g, "</pre>");

  return html;
};

/**
 * 将HTML转换为Typst标记（从编辑器获取内容）
 * @param {string} htmlContent - HTML格式的内容
 * @returns {string} Typst格式的内容
 */
export const htmlToTypst = (htmlContent) => {
  if (!htmlContent) return "";

  // 创建一个临时DOM元素来解析HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // 辅助函数：处理对齐的标题
  const processHeading = (node, level) => {
    const children = Array.from(node.childNodes).map(processNode).join("");
    const style = node.getAttribute("style") || "";
    const prefix = "=".repeat(level);

    if (style.includes("text-align: center")) {
      return `\n#align(center)[${prefix} ${children}]\n`;
    } else if (style.includes("text-align: right")) {
      return `\n#align(right)[${prefix} ${children}]\n`;
    } else if (style.includes("text-align: left")) {
      return `\n#align(left)[${prefix} ${children}]\n`;
    }
    return `\n${prefix} ${children}\n`;
  };

  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      const children = Array.from(node.childNodes).map(processNode).join("");

      // 根据标签类型进行转换
      switch (tagName) {
        case "h1":
          return processHeading(node, 1);
        case "h2":
          return processHeading(node, 2);
        case "h3":
          return processHeading(node, 3);
        case "strong":
        case "b":
          return `*${children}*`;
        case "em":
        case "i":
          return `_${children}_`;
        case "u":
          return `#underline[${children}]`;
        case "s":
          return `#strike[${children}]`;
        case "li":
          return `- ${children}`;
        case "ul": {
          const listItems = Array.from(node.children)
            .filter((child) => child.tagName.toLowerCase() === "li")
            .map((li) => {
              let content = processNode(li).replace(/^- /, "");
              // 去除列表项内容末尾的额外换行符
              content = content.replace(/\n\n$/, "");
              return `- ${content}`;
            })
            .join("\n");

          return `${listItems}\n\n`;
        }
        case "ol": {
          const orderedItems = Array.from(node.children)
            .filter((child) => child.tagName.toLowerCase() === "li")
            .map(
              (li, index) =>
                `${index + 1}. ${processNode(li).replace(/^- /, "")}`,
            )
            .join("\n");

          return `${orderedItems}`;
        }
        case "p":
          // 处理段落对齐
          const style = node.getAttribute("style") || "";
          if (style.includes("text-align: center")) {
            return `#align(center)[${children}]\n\n`;
          } else if (style.includes("text-align: right")) {
            return `#align(right)[${children}]\n\n`;
          } else if (style.includes("text-align: left")) {
            return `#align(left)[${children}]\n\n`;
          }
          return `${children}\n\n`;
        case "br":
          return "\n";
        default:
          return children;
      }
    }

    return "";
  };

  let result = processNode(tempDiv);

  // 清理多余的空行
  result = result
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "")
    .trim();
  // 清除列表项之间的多余空行
  result = result.replace(/\n\n- /g, "\n- ");

  return result;
};

/**
 * 验证Typst语法（基础验证）
 * @param {string} typstContent - Typst内容
 * @returns {{isValid: boolean, errors: Array<string>}}
 */
export const validateTypstSyntax = (typstContent) => {
  const errors = [];

  // 检查是否有未闭合的括号
  const openBrackets = (typstContent.match(/\[/g) || []).length;
  const closeBrackets = (typstContent.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push("方括号未正确闭合");
  }

  // 检查是否有未闭合的圆括号
  const openParens = (typstContent.match(/\(/g) || []).length;
  const closeParens = (typstContent.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push("圆括号未正确闭合");
  }

  // 检查是否有未闭合的花括号
  const openBraces = (typstContent.match(/\{/g) || []).length;
  const closeBraces = (typstContent.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push("花括号未正确闭合");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 格式化Typst代码（基础格式化）
 * @param {string} typstContent - 未格式化的Typst内容
 * @returns {string} 格式化后的内容
 */
export const formatTypstCode = (typstContent) => {
  if (!typstContent) return "";

  let formatted = typstContent;

  // 确保标题前后有适当的空行
  formatted = formatted.replace(/\n?(=+\s[^\n]+)\n?/g, "\n\n$1\n\n");

  // 清理多余的空行
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // 移除开头和结尾的空行
  formatted = formatted.trim();

  return formatted;
};

/**
 * 提取Typst文档的大纲
 * @param {string} typstContent - Typst内容
 * @returns {Array<{level: number, title: string, line: number}>}
 */
export const extractOutline = (typstContent) => {
  const outline = [];
  const lines = typstContent.split("\n");

  lines.forEach((line, index) => {
    const headingMatch = line.match(/^(=+)\s+(.+)$/);
    if (headingMatch) {
      outline.push({
        level: headingMatch[1].length,
        title: headingMatch[2].trim(),
        line: index + 1,
      });
    }
  });

  return outline;
};
