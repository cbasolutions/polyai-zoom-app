import { useEffect, useState } from 'react';
import { useZoomPhoneContext } from './hooks/useZoomPhoneContext';
import { fetchHandoffState } from './services/polyai';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { DataView } from './components/DataView';
import { PolyAIResponse } from './types';

type AppState = 'initializing' | 'waiting' | 'loading' | 'loaded' | 'error';

// Mock PolyAI API response for development mode
const MOCK_POLYAI_RESPONSE: PolyAIResponse = {
  data: {
    current_date_time: "2026-01-30 01:21:02",
    test_value_1: "ABC-234",
    test_value_2: "The call is a test call",
    x_trace_id: "1234567890123456789"
  },
  id: null,
  shared_id: "1234567890123456789"
};

function App() {
  const { context, sdkReady, error: sdkError, developmentMode, isFetchingFullContext } = useZoomPhoneContext();
  const [appState, setAppState] = useState<AppState>('initializing');
  const [polyData, setPolyData] = useState<PolyAIResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processedCallIds, setProcessedCallIds] = useState<Set<string>>(new Set());

  // Check for DEBUG mode via environment variable
  const debugMode = import.meta.env.VITE_DEBUG === 'true';

  // Collect debug info
  const debugInfo = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    hostname: window.location.hostname,
    sdkExists: typeof window.zoomSdk !== 'undefined',
    sdkReady,
    sdkError,
    developmentMode,
    appState,
    context,
    polyData,
    errorMessage,
    userAgent: navigator.userAgent,
    environment: {
      DEV: import.meta.env.DEV,
      MODE: import.meta.env.MODE,
      BASE_URL: import.meta.env.BASE_URL,
      VITE_DEBUG: import.meta.env.VITE_DEBUG
    }
  };

  useEffect(() => {
    if (sdkError) {
      setAppState('error');
      setErrorMessage(sdkError);
      return;
    }

    if (!sdkReady) {
      setAppState('initializing');
      return;
    }

    if (!context) {
      setAppState('waiting');
      return;
    }

    // Only process answered calls
    if (!context.isAnswered) {
      setAppState('waiting');
      return;
    }

    // Dedup: only process each call once
    const callKey = context.callId || `${context.projectId}:${context.traceId}`;
    if (processedCallIds.has(callKey)) {
      return;
    }

    // Check if we have required data
    if (!context.projectId || !context.traceId) {
      // If we're currently fetching full context, show loading state instead of error
      if (isFetchingFullContext) {
        setAppState('loading');
        return;
      }
      
      setAppState('error');
      setErrorMessage(
        'Missing required information from call. Please ensure the call was forwarded from PolyAI with proper queue naming.'
      );
      return;
    }

    // Fetch PolyAI data
    const fetchData = async () => {
      setAppState('loading');
      setErrorMessage(null);

      try {
        // In development mode, use mock data instead of API call
        if (developmentMode) {
          console.log('ðŸ“¦ Using mock PolyAI response in development mode');
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
          setPolyData(MOCK_POLYAI_RESPONSE);
          setAppState('loaded');
          setProcessedCallIds((prev) => new Set(prev).add(callKey));
          return;
        }

        // Production: fetch from real API
        const data = await fetchHandoffState(context.projectId!, context.traceId!);
        setPolyData(data);
        setAppState('loaded');
        setProcessedCallIds((prev) => new Set(prev).add(callKey));
      } catch (error) {
        console.error('Failed to fetch PolyAI data:', error);
        setAppState('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to fetch call information'
        );
      }
    };

    fetchData();
  }, [context, sdkReady, sdkError, processedCallIds, developmentMode, isFetchingFullContext]);

  const renderStatusIndicator = () => {
    let statusColor = 'bg-gray-400';
    let statusText = 'Initializing';

    switch (appState) {
      case 'initializing':
        statusColor = 'bg-yellow-400';
        statusText = 'Initializing SDK';
        break;
      case 'waiting':
        statusColor = 'bg-blue-400';
        statusText = 'Waiting for call';
        break;
      case 'loading':
        statusColor = 'bg-blue-500 animate-pulse';
        statusText = 'Loading';
        break;
      case 'loaded':
        statusColor = 'bg-green-500';
        statusText = 'Ready';
        break;
      case 'error':
        statusColor = 'bg-red-500';
        statusText = 'Error';
        break;
    }

    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
        <span className="text-gray-600">{statusText}</span>
      </div>
    );
  };

  const renderDebugInfo = () => {
    if (!context) return null;

    return (
      <div className="text-xs text-gray-500 space-y-1">
        {context.projectId && <div>Project: {context.projectId}</div>}
        {context.traceId && <div>Trace: {context.traceId}</div>}
        {context.callId && <div>Call: {context.callId}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* DEBUG MODE PANEL */}
      {debugMode && (
        <div className="bg-red-50 border-4 border-red-500 p-6 m-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-red-900">ðŸ” DEBUG MODE ACTIVE</h2>
            <span className="text-sm text-red-700">Environment Variable: VITE_DEBUG=true</span>
          </div>
          
          <div className="space-y-4">
            {/* SDK Status */}
            <div className="bg-white p-4 rounded border-2 border-red-300">
              <h3 className="font-bold text-lg mb-2 text-red-900">SDK Status</h3>
              <div className="font-mono text-sm space-y-1">
                <div>window.zoomSdk exists: <strong className={debugInfo.sdkExists ? 'text-green-600' : 'text-red-600'}>{String(debugInfo.sdkExists)}</strong></div>
                <div>SDK Ready: <strong className={sdkReady ? 'text-green-600' : 'text-red-600'}>{String(sdkReady)}</strong></div>
                <div>SDK Error: <strong className="text-red-600">{sdkError || 'None'}</strong></div>
                <div>Development Mode: <strong>{String(developmentMode)}</strong></div>
              </div>
            </div>

            {/* Environment */}
            <div className="bg-white p-4 rounded border-2 border-red-300">
              <h3 className="font-bold text-lg mb-2 text-red-900">Environment</h3>
              <div className="font-mono text-sm space-y-1">
                <div>Current URL: <strong>{debugInfo.url}</strong></div>
                <div>Hostname: <strong>{debugInfo.hostname}</strong></div>
                <div>import.meta.env.DEV: <strong>{String(debugInfo.environment.DEV)}</strong></div>
                <div>import.meta.env.MODE: <strong>{debugInfo.environment.MODE}</strong></div>
                <div>User Agent: <strong className="text-xs break-all">{debugInfo.userAgent}</strong></div>
              </div>
            </div>

            {/* App State */}
            <div className="bg-white p-4 rounded border-2 border-red-300">
              <h3 className="font-bold text-lg mb-2 text-red-900">App State</h3>
              <div className="font-mono text-sm space-y-1">
                <div>App State: <strong>{appState}</strong></div>
                <div>Error Message: <strong className="text-red-600">{errorMessage || 'None'}</strong></div>
                <div>Processed Call IDs: <strong>{processedCallIds.size}</strong></div>
              </div>
            </div>

            {/* Context Data */}
            <div className="bg-white p-4 rounded border-2 border-red-300">
              <h3 className="font-bold text-lg mb-2 text-red-900">Phone Context</h3>
              {context ? (
                <div className="font-mono text-sm space-y-1">
                  <div>Project ID: <strong>{context.projectId || 'NULL'}</strong></div>
                  <div>Trace ID: <strong>{context.traceId || 'NULL'}</strong></div>
                  <div>Call ID: <strong>{context.callId || 'NULL'}</strong></div>
                  <div>Is Answered: <strong>{String(context.isAnswered)}</strong></div>
                </div>
              ) : (
                <div className="text-gray-500">No context data yet</div>
              )}
            </div>

            {/* PolyAI Data */}
            <div className="bg-white p-4 rounded border-2 border-red-300">
              <h3 className="font-bold text-lg mb-2 text-red-900">PolyAI Response</h3>
              {polyData ? (
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
                  {JSON.stringify(polyData, null, 2)}
                </pre>
              ) : (
                <div className="text-gray-500">No PolyAI data yet</div>
              )}
            </div>

            {/* Full Debug Dump */}
            <div className="bg-white p-4 rounded border-2 border-red-300">
              <h3 className="font-bold text-lg mb-2 text-red-900">Full Debug Dump</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* NORMAL APP UI */}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">PolyAI Handoff</h1>
              <p className="text-sm text-gray-500 mt-1">Call Information Display</p>
            </div>
            {renderStatusIndicator()}
          </div>
          {developmentMode && (
            <div className="mt-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ðŸ”§ <strong>Development Mode:</strong> Running outside Zoom with mock data. 
                To test with real calls, open this app inside the Zoom client.
              </p>
            </div>
          )}
          {import.meta.env.DEV && (
            <div className="mt-2 pt-2 border-t border-gray-100">{renderDebugInfo()}</div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appState === 'initializing' && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Initializing Zoom SDK...</p>
          </div>
        )}

        {appState === 'waiting' && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Waiting for Call</h2>
            <p className="mt-2 text-sm text-gray-600">
              Call information will appear when an answered call is detected
            </p>
          </div>
        )}

        {appState === 'loading' && <LoadingSpinner />}

        {appState === 'error' && errorMessage && <ErrorMessage message={errorMessage} />}

        {appState === 'loaded' && polyData && context?.projectId && (
          <DataView data={polyData} projectId={context.projectId} />
        )}
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs text-gray-500">
            &copy; 2026 CBA Solutions, LLC &bull; Powered by PolyAI & Zoom
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
