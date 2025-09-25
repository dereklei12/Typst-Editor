# Typst Editor

A React-based WYSIWYG editor for Typst documents with real-time preview.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Start backend server (in another terminal)
cd typst-server
node server.js
```

Visit `http://localhost:3000` to use the editor.

## Features

- **Rich Text Editing**: Tiptap-based editor with toolbar
- **Real-time Preview**: Live PDF preview
- **Slash Commands**: Type `/` for quick formatting
- **Typst Syntax**: Full Typst markup support

## Key Commands

- `/bold`, `/italic` - Text formatting
- `/heading1-3` - Headers
- `/bulletList`, `/orderedList` - Lists
- `Ctrl+B/I/U` - Bold/Italic/Underline

## Project Structure

```
src/
├── components/
│   ├── Editor/      # Rich text editor
│   ├── Preview/     # PDF preview
│   └── Layout/      # UI layout
├── services/        # API calls
└── utils/           # Helpers

typst-server/        # Backend server
```

## Backend API

The editor requires a Typst compilation server running on port 8080:

- `POST /compile` - Compile Typst to PDF
- `GET /health` - Health check

## License

MIT
