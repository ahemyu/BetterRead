import React from 'react';
import { Highlighter, MessageCircle } from 'lucide-react';

interface SelectionTooltipProps {
  position: {
    x: number;
    y: number;
  };
  onHighlight: () => void;
  onAskAI: () => void;
  onClose: () => void;
}

export const SelectionTooltip: React.FC<SelectionTooltipProps> = ({
  position,
  onHighlight,
  onAskAI,
  onClose,
}) => {
  return (
    <div
      className="fixed bg-white shadow-lg rounded-lg px-2 py-1 flex gap-2 border z-50"
      style={{
        left: `${position.x}px`,
        top: `${Math.max(position.y - 45, 10)}px`, // Position above selection, min 10px from top
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onHighlight();
        }}
        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-1 text-sm"
        title="Highlight text"
      >
        <Highlighter size={16} />
        Highlight
      </button>
      <div className="w-px bg-gray-200" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAskAI();
        }}
        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-1 text-sm"
        title="Ask AI about this text"
      >
        <MessageCircle size={16} />
        Ask AI
      </button>
    </div>
  );
};