import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUserDocuments,
  createDocument,
  deleteDocument
} from '../../services/documentService';
import './DocumentManager.css';

export default function DocumentManager({ onSelectDocument, onNewDocument }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    loadDocuments();
  }, [currentUser]);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError('');
      const docs = await getUserDocuments(currentUser.uid);
      setDocuments(docs);
    } catch (err) {
      setError('加载文档失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleNewDocument() {
    try {
      setError('');
      const result = await createDocument(
        currentUser.uid,
        '新文档 ' + new Date().toLocaleDateString(),
        ''
      );
      await loadDocuments();
      onNewDocument(result.id);
    } catch (err) {
      setError('创建文档失败: ' + err.message);
    }
  }

  async function handleDeleteDocument(docId, e) {
    e.stopPropagation();
    if (!window.confirm('确定要删除这个文档吗？')) return;

    try {
      setError('');
      await deleteDocument(docId);
      await loadDocuments();
    } catch (err) {
      setError('删除文档失败: ' + err.message);
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return <div className="document-manager-loading">加载中...</div>;
  }

  return (
    <div className="document-manager">
      <div className="document-manager-header">
        <h3>我的文档</h3>
        <button onClick={handleNewDocument} className="btn-new-doc">
          + 新建文档
        </button>
      </div>

      {error && <div className="document-error">{error}</div>}

      <div className="document-list">
        {documents.length === 0 ? (
          <div className="no-documents">
            <p>还没有文档</p>
            <button onClick={handleNewDocument} className="btn-create-first">
              创建第一个文档
            </button>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="document-item"
              onClick={() => onSelectDocument(doc.id)}
            >
              <div className="document-info">
                <h4>{doc.title}</h4>
                <p className="document-date">
                  {formatDate(doc.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteDocument(doc.id, e)}
                className="btn-delete"
                title="删除"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
