// src/components/document/FileUpload.tsx
import React, { useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/epub+zip')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full max-w-xl mx-auto p-8 border-2 border-dashed border-gray-300 rounded-lg text-center"
    >
      <input
        type="file"
        accept=".pdf,.epub"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer text-blue-500 hover:text-blue-600"
      >
        Click to upload or drag and drop
        <p className="text-sm text-gray-500 mt-2">
          Supports PDF and EPUB files
        </p>
      </label>
    </div>
  );
};