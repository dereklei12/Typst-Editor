import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import EditorToolbar from "./EditorToolbar";
import TextAlign from "./extensions/TextAlign";
import FlexSpace from "./extensions/FlexSpace";
import Line from "./extensions/Line";
import VerticalSpace from "./extensions/VerticalSpace";
import SlashCommands from "./SlashCommands";
import { typstToHtml, htmlToTypst } from "../../utils/typstUtils";
import { updateFontInContent } from "../../utils/fontUtils";

const TypstEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
      }),
      Bold,
      Italic,
      Underline,
      Strike,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
      TextAlign,
      FlexSpace,
      Line,
      VerticalSpace,
      SlashCommands,
    ],
    content: typstToHtml(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const typstContent = htmlToTypst(html);
      onChange(typstContent);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });

  const handleFontChange = (latinFont, cjkFont) => {
    const updatedContent = updateFontInContent(content, latinFont, cjkFont);
    onChange(updatedContent);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <EditorToolbar
        editor={editor}
        content={content}
        onFontChange={handleFontChange}
      />
      <div
        style={{
          flex: 1,
          overflow: "auto",
          border: "none",
          background: "white",
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TypstEditor;
