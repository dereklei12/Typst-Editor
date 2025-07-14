import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowLeftRight,
} from "lucide-react";

const CommandsList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    {
      title: "粗体",
      description: "加粗选中的文本",
      icon: <Bold className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBold().run();
      },
    },
    {
      title: "斜体",
      description: "倾斜选中的文本",
      icon: <Italic className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleItalic().run();
      },
    },
    {
      title: "下划线",
      description: "为文本添加下划线",
      icon: <Underline className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleUnderline().run();
      },
    },
    {
      title: "删除线",
      description: "为文本添加删除线",
      icon: <Strikethrough className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleStrike().run();
      },
    },
    {
      title: "一级标题",
      description: "大号标题",
      icon: <Heading1 className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run();
      },
    },
    {
      title: "二级标题",
      description: "中号标题",
      icon: <Heading2 className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run();
      },
    },
    {
      title: "三级标题",
      description: "小号标题",
      icon: <Heading3 className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run();
      },
    },
    {
      title: "无序列表",
      description: "创建简单的无序列表",
      icon: <List className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "有序列表",
      description: "创建带编号的列表",
      icon: <ListOrdered className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "左对齐",
      description: "将文本左对齐",
      icon: <AlignLeft className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setTextAlign("left").run();
      },
    },
    {
      title: "居中对齐",
      description: "将文本居中对齐",
      icon: <AlignCenter className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setTextAlign("center").run();
      },
    },
    {
      title: "右对齐",
      description: "将文本右对齐",
      icon: <AlignRight className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setTextAlign("right").run();
      },
    },
    {
      title: "弹性空间",
      description: "插入弹性水平空间 #h(1fr)",
      icon: <ArrowLeftRight className="slash-command-icon" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertFlexSpace().run();
      },
    },
  ];

  const filteredCommands = commands.filter((command) =>
    command.title.toLowerCase().includes(props.query.toLowerCase()),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.query]);

  const selectItem = (index) => {
    const command = filteredCommands[index];
    if (command) {
      command.command(props);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex(
          (selectedIndex + filteredCommands.length - 1) %
            filteredCommands.length,
        );
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % filteredCommands.length);
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="slash-command">
      {filteredCommands.length ? (
        filteredCommands.map((command, index) => (
          <div
            key={index}
            className={`slash-command-item ${
              index === selectedIndex ? "is-selected" : ""
            }`}
            onClick={() => selectItem(index)}
          >
            {command.icon}
            <div className="slash-command-content">
              <div className="slash-command-title">{command.title}</div>
              <div className="slash-command-description">
                {command.description}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="slash-command-item">
          <div className="slash-command-content">
            <div className="slash-command-title">没有找到结果</div>
            <div className="slash-command-description">尝试其他关键词</div>
          </div>
        </div>
      )}
    </div>
  );
});

const SlashCommands = Extension.create({
  name: "slashCommands",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }) => {
          return [
            "bold",
            "italic",
            "underline",
            "strike",
            "heading1",
            "heading2",
            "heading3",
            "bulletList",
            "orderedList",
            "left",
            "center",
            "right",
            "flexSpace",
          ].filter((item) =>
            item.toLowerCase().startsWith(query.toLowerCase()),
          );
        },
        render: () => {
          let component;
          let popup;

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandsList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown(props) {
              if (props.event.key === "Escape") {
                popup[0].hide();
                return true;
              }

              return component.ref?.onKeyDown(props);
            },

            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});

export default SlashCommands;
