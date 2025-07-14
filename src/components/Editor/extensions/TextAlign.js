import { Extension } from "@tiptap/core";

const TextAlign = Extension.create({
  name: "textAlign",

  addOptions() {
    return {
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right"],
      defaultAlignment: "left",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element) => {
              const textAlign =
                element.style.textAlign || this.options.defaultAlignment;
              return this.options.alignments.includes(textAlign)
                ? textAlign
                : this.options.defaultAlignment;
            },
            renderHTML: (attributes) => {
              if (attributes.textAlign === this.options.defaultAlignment) {
                return {};
              }
              return {
                style: `text-align: ${attributes.textAlign}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment) =>
        ({ commands }) => {
          if (!this.options.alignments.includes(alignment)) {
            return false;
          }

          return this.options.types.every((type) =>
            commands.updateAttributes(type, { textAlign: alignment }),
          );
        },

      unsetTextAlign:
        () =>
        ({ commands }) => {
          return this.options.types.every((type) =>
            commands.resetAttributes(type, "textAlign"),
          );
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-l": () => this.editor.commands.setTextAlign("left"),
      "Mod-Shift-e": () => this.editor.commands.setTextAlign("center"),
      "Mod-Shift-r": () => this.editor.commands.setTextAlign("right"),
    };
  },
});

export default TextAlign;
