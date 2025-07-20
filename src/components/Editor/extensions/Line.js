import { Node } from "@tiptap/core";

const Line = Node.create({
  name: "line",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      "data-typst": {
        default: "#line(length: 100%)",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'hr[class="typst-line"]',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "hr",
      {
        class: "typst-line",
        "data-typst": "#line(length: 100%)",
        ...HTMLAttributes,
      },
    ];
  },

  addCommands() {
    return {
      insertLine:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-Minus": () => this.editor.commands.insertLine(),
    };
  },
});

export default Line;
