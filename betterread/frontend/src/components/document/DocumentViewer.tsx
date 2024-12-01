import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface DocumentViewerProps {
  file: File | null;
  onSelection?: (selection: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ file, onSelection }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setError(null);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully');
    setNumPages(numPages);
    setError(null);
  };

  const handleLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please ensure the file is not corrupted and try again.');
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      onSelection?.(selection.toString());
    }
  };

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-2 text-sm text-blue-500 hover:text-blue-600"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {fileUrl && (
        <>
          <div 
            className="w-full bg-white shadow-lg rounded-lg overflow-hidden"
            onMouseUp={handleTextSelection}
          >
            <Document
              file={fileUrl}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
              loading={
                <div className="flex justify-center items-center p-8">
                  <div className="animate-pulse text-gray-600">Loading PDF...</div>
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                width={window.innerWidth * 0.8}
                className="mx-auto"
                loading={
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-pulse text-gray-600">Loading page...</div>
                  </div>
                }
                error={
                  <div className="text-center p-4 text-red-500">
                    Error loading page. Please try again.
                  </div>
                }
              />
            </Document>
          </div>
          
          {numPages > 0 && (
            <div className="flex items-center gap-4 mt-4 p-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {numPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
                disabled={currentPage >= numPages}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};