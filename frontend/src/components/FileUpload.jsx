import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, File, CheckCircle2, AlertCircle, X } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Explicitly using 127.0.0.1 to avoid macOS IPv6 resolution issues
const UPLOAD_URL = 'http://127.0.0.1:5001/api/upload';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedData, setUploadedData] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef();

  // Validate File Size & Type on Client Side
  const validateFile = (selectedFile) => {
    setError('');

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a PNG, JPG, WEBP, or PDF.');
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5MB.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setUploadedData(null);

      // Create Local Image Preview if file is an image
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  // Drag and Drop Handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  // Upload File to Backend
  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setProgress(0);
    setError('');

    try {
      const response = await axios.post(UPLOAD_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      setUploadedData(response.data);
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Full upload error details:', err);
      
      // Extract exact server error or network failure reason
      const serverError = err.response?.data?.error;
      const statusText = err.response?.statusText;
      const networkError = err.message;

      setError(
        `Upload failed: ${serverError || statusText || networkError || 'Connection refused by backend.'}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const resetSelection = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setProgress(0);
  };

  return (
    <div style={styles.card}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#1e293b' }}>
        Upload Files
      </h2>

      {/* Drop Zone Area */}
      <div
        style={{
          ...styles.dropzone,
          borderColor: isDragOver ? '#3b82f6' : '#cbd5e1',
          backgroundColor: isDragOver ? '#eff6ff' : '#f8fafc',
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <UploadCloud size={40} color="#3b82f6" style={{ margin: '0 auto' }} />
        <p style={{ margin: '8px 0', fontWeight: '500', color: '#334155' }}>
          Drag and drop your file here, or <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>browse</span>
        </p>
        <span style={styles.subtext}>Supports PNG, JPG, WEBP, or PDF up to 5MB</span>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Local Preview Section */}
      {file && (
        <div style={styles.previewContainer}>
          <div style={styles.fileInfo}>
            {preview ? (
              <img src={preview} alt="Preview" style={styles.thumbnail} />
            ) : (
              <File size={32} color="#64748b" />
            )}
            <div style={{ flex: 1, marginLeft: '12px', textAlign: 'left', overflow: 'hidden' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1e293b' }}>
                {file.name}
              </p>
              <span style={styles.subtext}>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            {!isUploading && (
              <button onClick={resetSelection} style={styles.iconBtn} title="Remove file">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${progress}%` }} />
            </div>
          )}

          <button onClick={uploadFile} disabled={isUploading} style={styles.uploadBtn}>
            {isUploading ? `Uploading (${progress}%)...` : 'Upload File'}
          </button>
        </div>
      )}

      {/* Successfully Uploaded State */}
      {uploadedData && (
        <div style={styles.successCard}>
          <CheckCircle2 size={24} color="#22c55e" style={{ flexShrink: 0 }} />
          <div style={{ marginLeft: '12px', textAlign: 'left' }}>
            <h4 style={{ margin: 0, color: '#15803d' }}>Upload Complete!</h4>
            <a
              href={uploadedData.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.downloadLink}
            >
              View Uploaded File ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    maxWidth: '480px',
    margin: '2rem auto',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    fontFamily: 'sans-serif',
    backgroundColor: '#ffffff',
  },
  dropzone: {
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  subtext: { fontSize: '12px', color: '#64748b' },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fef2f2',
    color: '#991b1b',
    padding: '0.75rem',
    borderRadius: '6px',
    marginTop: '1rem',
    fontSize: '14px',
    wordBreak: 'break-word',
  },
  previewContainer: { marginTop: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' },
  fileInfo: { display: 'flex', alignItems: 'center', marginBottom: '12px' },
  thumbnail: { width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' },
  iconBtn: { border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' },
  progressTrack: { height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' },
  progressBar: { height: '100%', background: '#3b82f6', transition: 'width 0.2s' },
  uploadBtn: { width: '100%', padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  successCard: { display: 'flex', alignItems: 'center', background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginTop: '1rem' },
  downloadLink: { fontSize: '14px', color: '#15803d', fontWeight: '500', textDecoration: 'none' },
};