import React, { useState } from 'react';
import { DocumentViewer } from './components/document/DocumentViewer';
import { TextSelection } from './components/document/DocumentViewer';
import { FileUpload } from './components/document/FileUpload';


function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selections, setSelections] = useState<TextSelection[]>([]);
  const [aiQuery, setAiQuery] = useState<TextSelection | null>(null);

  const handleSelection = (selection: TextSelection) => {
    setSelections(prev => [...prev, selection]);
  };

  const handleAskAI = (selection: TextSelection) => {
    setAiQuery(selection);
    // Here you would typically open your AI chat interface
    console.log('Asking AI about:', selection.text);
  };

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
        <div className="space-y-4">
          <DocumentViewer 
            file={selectedFile}
            onSelection={handleSelection}
            onAskAI={handleAskAI}
          />
          
          {aiQuery && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <h2 className="font-semibold mb-2">AI Query:</h2>
              <p className="text-gray-600">{aiQuery.text}</p>
              <p className="text-sm text-gray-500 mt-1">
                From page {aiQuery.pageNumber}
              </p>
            </div>
          )}
          
          {selections.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <h2 className="font-semibold mb-2">Highlights:</h2>
              <div className="space-y-2">
                {selections.map(selection => (
                  <div 
                    key={selection.id}
                    className="p-2 border rounded"
                  >
                    <p className="text-sm text-gray-600">
                      Page {selection.pageNumber}
                    </p>
                    <p>{selection.text}</p>
                    <p className="text-xs text-gray-500">
                      Selected at: {selection.timestamp.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;