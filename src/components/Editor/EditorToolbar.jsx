import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowLeftRight,
} from "lucide-react";

const EditorToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      onClick={onClick}
      className={`toolbar-button ${isActive ? "is-active" : ""}`}
      title={title}
    >
      {children}
    </button>
  );

  const Separator = () => <div className="toolbar-separator" />;

  return (
    <div className="editor-toolbar">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="粗体 (Ctrl+B)"
      >
        <Bold size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="斜体 (Ctrl+I)"
      >
        <Italic size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="下划线 (Ctrl+U)"
      >
        <Underline size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="删除线"
      >
        <Strikethrough size={16} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="一级标题"
      >
        <Heading1 size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="二级标题"
      >
        <Heading2 size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="三级标题"
      >
        <Heading3 size={16} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={
          editor.isActive({ textAlign: "left" }) ||
          (!editor.isActive({ textAlign: "center" }) &&
            !editor.isActive({ textAlign: "right" }))
        }
        title="左对齐 (Ctrl+Shift+L)"
      >
        <AlignLeft size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="居中对齐 (Ctrl+Shift+E)"
      >
        <AlignCenter size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="右对齐 (Ctrl+Shift+R)"
      >
        <AlignRight size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().insertFlexSpace().run()}
        isActive={false}
        title="弹性空间 #h(1fr) (Ctrl+Shift+Space)"
      >
        <ArrowLeftRight size={16} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="无序列表"
      >
        <List size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="有序列表"
      >
        <ListOrdered size={16} />
      </ToolbarButton>
    </div>
  );
};

export default EditorToolbar;
