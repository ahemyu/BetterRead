import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { SelectionTooltip } from './SelectionTooltip';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextSelection {
  id: string;
  text: string;
  pageNumber: number;
  position: Position;
  timestamp: Date;
}

interface DocumentViewerProps {
  file: File | null;
  onSelection?: (selection: TextSelection) => void;
  onAskAI?: (selection: TextSelection) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  file, 
  onSelection,
  onAskAI 
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<TextSelection[]>([]);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentSelectionData, setCurrentSelectionData] = useState<TextSelection | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setError(null);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const handleLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please ensure the file is not corrupted and try again.');
  };

  const clearTooltip = useCallback(() => {
    setTooltipPosition(null);
    setCurrentSelectionData(null);
  }, []);

  useEffect(() => {
    // Add click listener to clear tooltip when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const tooltip = document.querySelector('[data-tooltip]');
      if (tooltip && !tooltip.contains(e.target as Node)) {
        clearTooltip();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearTooltip]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      clearTooltip();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Get the PDF container element
    const pdfContainer = document.querySelector('.react-pdf__Page');
    if (!pdfContainer) return;

    const containerRect = pdfContainer.getBoundingClientRect();

    // Calculate position relative to PDF container
    const position: Position = {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height
    };

    const selectionData: TextSelection = {
      id: crypto.randomUUID(),
      text: selectedText,
      pageNumber: currentPage,
      position,
      timestamp: new Date()
    };

    setCurrentSelectionData(selectionData);
    setTooltipPosition({
      x: rect.left + (rect.width / 2),
      y: rect.top
    });
  }, [currentPage, clearTooltip]);

  const highlightSelection = useCallback((selection: TextSelection) => {
    const highlight = document.createElement('div');
    highlight.className = 'absolute bg-yellow-200 opacity-50 pointer-events-none';
    highlight.style.left = `${selection.position.x}px`;
    highlight.style.top = `${selection.position.y}px`;
    highlight.style.width = `${selection.position.width}px`;
    highlight.style.height = `${selection.position.height}px`;
    highlight.setAttribute('data-selection-id', selection.id);

    const container = document.querySelector('.react-pdf__Page');
    if (container) {
      container.appendChild(highlight);
    }
  }, []);

  const handleHighlight = useCallback(() => {
    if (currentSelectionData) {
      setSelections(prev => [...prev, currentSelectionData]);
      highlightSelection(currentSelectionData);
      onSelection?.(currentSelectionData);
      clearTooltip();
    }
  }, [currentSelectionData, highlightSelection, onSelection, clearTooltip]);

  const handleAskAI = useCallback(() => {
    if (currentSelectionData) {
      onAskAI?.(currentSelectionData);
      clearTooltip();
    }
  }, [currentSelectionData, onAskAI, clearTooltip]);

  // Re-render highlights when page changes
  useEffect(() => {
    // Clear existing highlights
    const highlights = document.querySelectorAll('[data-selection-id]');
    highlights.forEach(highlight => highlight.remove());

    // Render highlights for current page
    selections
      .filter(selection => selection.pageNumber === currentPage)
      .forEach(highlightSelection);
  }, [currentPage, selections, highlightSelection]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {fileUrl && (
        <>
          <div 
            className="w-full bg-white shadow-lg rounded-lg overflow-hidden relative"
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
              />
            </Document>
          </div>
          
          {tooltipPosition && (
            <SelectionTooltip
              position={tooltipPosition}
              onHighlight={handleHighlight}
              onAskAI={handleAskAI}
              onClose={clearTooltip}
            />
          )}
          
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