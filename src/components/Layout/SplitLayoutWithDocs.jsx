import React, { useState, useCallback, useEffect } from "react";
import TypstEditor from "../Editor/TypstEditor";
import TypstPreview from "../Preview/TypstPreview";
import DocumentManager from "../Documents/DocumentManager";
import useTypstCompiler from "../../hooks/useTypstCompiler";
import { useAuth } from "../../contexts/AuthContext";
import { getDocument, updateDocument } from "../../services/documentService";
import "./SplitLayoutWithDocs.css";

const SplitLayoutWithDocs = () => {
  const { currentUser, logout } = useAuth();
  const [content, setContent] = useState("");
  const [currentDocId, setCurrentDocId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("无标题文档");
  const [showDocuments, setShowDocuments] = useState(true);
  const [saveStatus, setSaveStatus] = useState(""); // saved, saving, error

  const { pngPages, isCompiling, error } = useTypstCompiler(content, {
    debounceDelay: 300,
  });

  // Auto-save functionality
  useEffect(() => {
    if (!currentDocId || !content) return;

    const timeoutId = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await updateDocument(currentDocId, documentTitle, content);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(""), 2000);
      } catch (err) {
        setSaveStatus("error");
        console.error("Auto-save failed:", err);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [content, currentDocId, documentTitle]);

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
  }, []);

  const handleSelectDocument = async (docId) => {
    try {
      const doc = await getDocument(docId);
      setCurrentDocId(doc.id);
      setContent(doc.content || "");
      setDocumentTitle(doc.title || "无标题文档");
      setShowDocuments(false);
    } catch (err) {
      console.error("Failed to load document:", err);
    }
  };

  const handleNewDocument = async (docId) => {
    try {
      const doc = await getDocument(docId);
      setCurrentDocId(doc.id);
      setContent("");
      setDocumentTitle(doc.title || "新文档");
      setShowDocuments(false);
    } catch (err) {
      console.error("Failed to create document:", err);
    }
  };

  const handleTitleChange = (e) => {
    setDocumentTitle(e.target.value);
  };

  return (
    <div className="split-layout-container">
      {/* Top toolbar */}
      <div className="top-toolbar">
        <button
          onClick={() => setShowDocuments(!showDocuments)}
          className="btn-toggle-docs"
        >
          {showDocuments ? "隐藏文档列表" : "显示文档列表"}
        </button>

        {currentDocId && (
          <input
            type="text"
            value={documentTitle}
            onChange={handleTitleChange}
            className="document-title-input"
            placeholder="文档标题"
          />
        )}

        <div className="toolbar-right">
          {saveStatus === "saving" && (
            <span className="save-status saving">保存中...</span>
          )}
          {saveStatus === "saved" && (
            <span className="save-status saved">已保存 ✓</span>
          )}
          {saveStatus === "error" && (
            <span className="save-status error">保存失败</span>
          )}

          <span className="user-email">{currentUser?.email}</span>
          <button onClick={logout} className="btn-logout">
            退出
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Document sidebar */}
        {showDocuments && (
          <div className="document-sidebar">
            <DocumentManager
              onSelectDocument={handleSelectDocument}
              onNewDocument={handleNewDocument}
            />
          </div>
        )}

        {/* Editor and Preview */}
        <div className="editor-preview-container">
          {/* Left side - Editor */}
          <div className="editor-pane">
            {currentDocId ? (
              <TypstEditor content={content} onChange={handleContentChange} />
            ) : (
              <div className="no-document-selected">
                <p>请选择或创建一个文档开始编辑</p>
              </div>
            )}
          </div>

          {/* Right side - Preview */}
          <div className="preview-pane">
            <TypstPreview
              pngPages={pngPages}
              isCompiling={isCompiling}
              error={error}
              sourceCode={content}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitLayoutWithDocs;
