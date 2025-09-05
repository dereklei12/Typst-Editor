import { Node } from "@tiptap/core";

const VerticalSpace = Node.create({
  name: "verticalSpace",
  
  group: "block",
  
  atom: true,

  addAttributes() {
    return {
      "data-typst": {
        default: "#v(1em)",
      },
      spacing: {
        default: "1em",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[class="typst-vertical-space"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const spacing = HTMLAttributes.spacing || "1em";
    const typstCode = `#v(${spacing})`;
    
    return [
      "div",
      {
        class: "typst-vertical-space",
        "data-typst": typstCode,
        style: `height: ${spacing.includes('fr') ? '20px' : spacing}; display: block; border-top: 1px dashed #ccc; position: relative;`,
        ...HTMLAttributes,
      },
      [
        "span",
        {
          style: "position: absolute; left: 50%; top: -10px; transform: translateX(-50%); background: white; padding: 0 5px; color: #888; font-size: 12px;",
        },
        `↕ ${spacing}`,
      ],
    ];
  },

  addCommands() {
    return {
      insertVerticalSpace:
        (options = {}) =>
        ({ commands }) => {
          const { spacing = "1em" } = options;
          return commands.insertContent({
            type: this.name,
            attrs: {
              "data-typst": `#v(${spacing})`,
              spacing,
            },
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-Enter": () => {
        // Prompt user for input
        const spacing = prompt("请输入垂直空间大小，例如：1em, 2pt, 1fr", "1em");
        if (spacing && spacing.trim()) {
          const trimmedSpacing = spacing.trim();
          
          // Basic validation for common units
          if (!/^\d+(\.\d+)?(em|pt|fr)$/.test(trimmedSpacing)) {
            alert("请输入有效格式，例如：1em, 2pt, 1fr");
            return false;
          }
          
          return this.editor.commands.insertVerticalSpace({ spacing: trimmedSpacing });
        }
        return false;
      },
    };
  },
});

export default VerticalSpace;