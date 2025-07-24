import React, { useRef } from 'react';

interface CharacterUploadProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

export const CharacterUpload: React.FC<CharacterUploadProps> = ({ onUpload, loading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      onUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div 
      className="upload-area"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="upload-content">
        <div className="upload-icon">
          📄
        </div>
        <h3 className="upload-title">Upload Character Sheet</h3>
        <p className="upload-description">
          Upload a character file exported from Pathbuilder to display your character's 
          actions, feats, spells, and equipment with interactive tooltips.
        </p>
        <button 
          className="upload-button" 
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {loading && <span className="loading-spinner" />}
          {loading ? 'Processing...' : 'Select File'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="file-input"
        />
      </div>
    </div>
  );
};