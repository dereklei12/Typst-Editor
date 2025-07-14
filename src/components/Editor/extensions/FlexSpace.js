import { Node } from "@tiptap/core";

const FlexSpace = Node.create({
  name: "flexSpace",
  
  group: "inline",
  
  inline: true,
  
  atom: true,

  addAttributes() {
    return {
      "data-typst": {
        default: "#h(1fr)",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[class="typst-flex-space"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        class: "typst-flex-space",
        "data-typst": "#h(1fr)",
        ...HTMLAttributes,
      },
      "↔",
    ];
  },

  addCommands() {
    return {
      insertFlexSpace:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              "data-typst": "#h(1fr)",
            },
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-Space": () => this.editor.commands.insertFlexSpace(),
    };
  },
});

export default FlexSpace;