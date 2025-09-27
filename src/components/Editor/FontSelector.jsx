import React, { useState, useEffect } from 'react';
import { Type } from 'lucide-react';
import { getLatinFonts, getCJKFonts, extractFontSettings } from '../../utils/fontUtils';

const FontSelector = ({ content, onFontChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFonts, setCurrentFonts] = useState({
    latinFont: 'Arial',
    cjkFont: 'Source Han Serif SC'
  });

  const latinFonts = getLatinFonts();
  const cjkFonts = getCJKFonts();

  // 从内容中提取当前字体设置
  useEffect(() => {
    const fonts = extractFontSettings(content);
    setCurrentFonts(fonts);
  }, [content]);

  const handleLatinFontChange = (fontName) => {
    const newFonts = { ...currentFonts, latinFont: fontName };
    setCurrentFonts(newFonts);
    onFontChange(newFonts.latinFont, newFonts.cjkFont);
  };

  const handleCJKFontChange = (fontName) => {
    const newFonts = { ...currentFonts, cjkFont: fontName };
    setCurrentFonts(newFonts);
    onFontChange(newFonts.latinFont, newFonts.cjkFont);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="font-selector">
      <button
        onClick={toggleDropdown}
        className={`toolbar-button ${isOpen ? 'is-active' : ''}`}
        title="字体选择器"
      >
        <Type size={16} />
      </button>

      {isOpen && (
        <div className="font-selector-dropdown">
          <div className="font-selector-section">
            <label className="font-selector-label">西文字体:</label>
            <select
              value={currentFonts.latinFont}
              onChange={(e) => handleLatinFontChange(e.target.value)}
              className="font-selector-select"
            >
              {latinFonts.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="font-selector-section">
            <label className="font-selector-label">中文字体:</label>
            <select
              value={currentFonts.cjkFont}
              onChange={(e) => handleCJKFontChange(e.target.value)}
              className="font-selector-select"
            >
              {cjkFonts.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="font-selector-preview">
            <div className="font-preview-text" style={{ fontFamily: currentFonts.latinFont }}>
              ABC 123 Hello
            </div>
            <div className="font-preview-text" style={{ fontFamily: currentFonts.cjkFont }}>
              你好世界 测试文字
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="font-selector-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FontSelector;
