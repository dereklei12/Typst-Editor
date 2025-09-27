/**
 * 字体工具类 - 用于处理字体相关功能
 */

// 预定义的西文字体列表（基于fonts/Latin文件夹）
const LATIN_FONTS = [
  { name: "Arial", displayName: "Arial" },
  { name: "Calibri", displayName: "Calibri" },
  { name: "Helvetica", displayName: "Helvetica" },
  { name: "Lato", displayName: "Lato" },
  { name: "PT Sans", displayName: "PT Sans" },
  { name: "PT Serif", displayName: "PT Serif" },
  { name: "Baskerville", displayName: "Baskerville" },
];

// 预定义的中文字体列表（基于fonts/SC文件夹）
const CJK_FONTS = [
  { name: "SimSun", displayName: "宋体" },
  { name: "Songti SC", displayName: "宋体-简" },
  { name: "STHeiti", displayName: "华文黑体" },
];

/**
 * 获取可用的西文字体列表
 * @returns {Array} 西文字体数组
 */
export function getLatinFonts() {
  return LATIN_FONTS;
}

/**
 * 获取可用的中文字体列表
 * @returns {Array} 中文字体数组
 */
export function getCJKFonts() {
  return CJK_FONTS;
}

/**
 * 生成字体设置的Typst代码
 * @param {string} latinFont - 西文字体名称
 * @param {string} cjkFont - 中文字体名称
 * @returns {string} Typst字体设置代码
 */
export function generateFontSetting(latinFont = "Arial", cjkFont = "SimSun") {
  return `#set text(font: ((name: "${latinFont}", covers: "latin-in-cjk"), "${cjkFont}"))`;
}

/**
 * 从Typst内容中提取当前的字体设置
 * @param {string} content - Typst文档内容
 * @returns {Object} 包含latinFont和cjkFont的对象
 */
export function extractFontSettings(content) {
  // 匹配字体设置的正则表达式
  const fontRegex =
    /#set\s+text\s*\(\s*font:\s*\(\s*\(\s*name:\s*"([^"]+)"\s*,\s*covers:\s*"[^"]*"\s*\)\s*,\s*"([^"]+)"\s*\)\s*\)/;

  const match = content.match(fontRegex);

  if (match) {
    return {
      latinFont: match[1],
      cjkFont: match[2],
    };
  }

  // 默认值
  return {
    latinFont: "Arial",
    cjkFont: "SimSun",
  };
}

/**
 * 更新Typst内容中的字体设置
 * @param {string} content - 原始Typst文档内容
 * @param {string} latinFont - 新的西文字体
 * @param {string} cjkFont - 新的中文字体
 * @returns {string} 更新后的Typst文档内容
 */
export function updateFontInContent(content, latinFont, cjkFont) {
  const newFontSetting = generateFontSetting(latinFont, cjkFont);

  // 检查是否已经有字体设置
  const fontRegex =
    /#set\s+text\s*\(\s*font:\s*\(\s*\(\s*name:\s*"[^"]+"\s*,\s*covers:\s*"[^"]*"\s*\)\s*,\s*"[^"]+"\s*\)\s*\)/;

  if (fontRegex.test(content)) {
    // 替换现有的字体设置
    return content.replace(fontRegex, newFontSetting);
  } else {
    // 在文档开头添加字体设置
    return newFontSetting + "\n" + content;
  }
}
