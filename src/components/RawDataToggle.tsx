import { useState } from 'react';
import { PolyAIResponse } from '../types';

interface RawDataToggleProps {
  data: PolyAIResponse;
}

export function RawDataToggle({ data }: RawDataToggleProps) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowRaw(!showRaw)}
        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        <svg
          className={`w-4 h-4 mr-2 transition-transform ${showRaw ? 'transform rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showRaw ? 'Hide' : 'Show'} Raw Data
      </button>

      {showRaw && (
        <div className="mt-3 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              JSON Response
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              title="Copy to clipboard"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 text-xs text-gray-800 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
