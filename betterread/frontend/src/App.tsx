import React, { useState } from 'react';
import { DocumentViewer } from './components/document/DocumentViewer';
import { FileUpload } from './components/document/FileUpload';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          BetterRead
        </h1>
      </header>

      {!selectedFile ? (
        <FileUpload onFileSelect={setSelectedFile} />
      ) : (
        <DocumentViewer 
          file={selectedFile}
          onSelection={setSelectedText}
        />
      )}

      {selectedText && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold mb-2">Selected Text:</h2>
          <p>{selectedText}</p>
        </div>
      )}
    </div>
  );
}

export default App;