import { useState, useEffect, useCallback } from 'react';
import { ZoomPhoneContext } from '../types';

interface ParsedContext {
  projectId: string | null;
  traceId: string | null;
  callId: string | null;
  isAnswered: boolean;
}

// Mock data for development/testing outside Zoom
const MOCK_CONTEXT: ZoomPhoneContext = {
  activeTab: "History",
  callId: "mock-call-id-123456",
  callObject: {
    accountId: "mock-account-abc123",
    answerStartTime: "2026-01-30 04:20:52",
    callEndTime: "2026-01-30 04:20:55",
    callee: {
      deviceId: "",
      extensionId: "mock-extension-456",
      extensionNumber: "1001",
      extensionType: "User",
      phoneNumber: "+15555551001",
      timezone: "",
      userId: "mock-user-789"
    },
    caller: {
      extensionId: "sales_queue__EXAMPLE-PROJECT-123",
      extensionNumber: "mock-queue-abc",
      extensionType: "CallQueue",
      phoneNumber: "+15555551000",
      timezone: "",
      userId: ""
    },
    forwardedBy: {
      extensionNumber: "1002",
      extensionType: "\u0002",
      name: "sales_queue__EXAMPLE-PROJECT-123"
    },
    ringingStartTime: "2026-01-30 04:20:50",
    traceId: "1234567890123456789"
  },
  callStatus: "Active",
  direction: "Unknown",
  eventTs: "2026-01-30 04:20:55"
};

/**
 * Extract projectID from forwardedBy.name
 * Format: <anything>__<projectID>
 * Example: "zoomapp test__PROJECT-1PYAZS6A" -> "PROJECT-1PYAZS6A"
 */
function extractProjectId(ctx: ZoomPhoneContext): string | null {
  const name = ctx?.callObject?.forwardedBy?.name || '';
  if (!name) return null;

  const lastDoubleUnderscore = name.lastIndexOf('__');
  if (lastDoubleUnderscore === -1) return null;

  const projectId = name.substring(lastDoubleUnderscore + 2).trim();
  return projectId || null;
}

/**
 * Extract traceId from callObject
 */
function extractTraceId(ctx: ZoomPhoneContext): string | null {
  return ctx?.callObject?.traceId || ctx?.traceId || null;
}

/**
 * Extract callId
 */
function extractCallId(ctx: ZoomPhoneContext): string | null {
  return ctx?.callId || ctx?.callObject?.traceId || null;
}

/**
 * Check if call is answered/active
 */
function isCallAnswered(ctx: ZoomPhoneContext): boolean {
  const rootStatus = String(ctx?.callStatus || '').toLowerCase();
  const objectStatus = String(ctx?.callObject?.callStatus || ctx?.callObject?.status || '').toLowerCase();

  const activeStates = ['active', 'connected', 'incall', 'in_call', 'in call'];
  return activeStates.includes(rootStatus) || activeStates.includes(objectStatus);
}

/**
 * Parse phone context into structured data
 */
function parsePhoneContext(ctx: ZoomPhoneContext): ParsedContext {
  return {
    projectId: extractProjectId(ctx),
    traceId: extractTraceId(ctx),
    callId: extractCallId(ctx),
    isAnswered: isCallAnswered(ctx)
  };
}

/**
 * Custom hook to manage Zoom Phone context
 */
export function useZoomPhoneContext() {
  const [context, setContext] = useState<ParsedContext | null>(null);
  const [rawContext, setRawContext] = useState<ZoomPhoneContext | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [developmentMode, setDevelopmentMode] = useState(false);
  const [isFetchingFullContext, setIsFetchingFullContext] = useState(false);

  const processContext = useCallback((ctx: ZoomPhoneContext, source: string) => {
    console.log(`[${source}] Phone context received:`, ctx);
    setRawContext(ctx);

    const parsed = parsePhoneContext(ctx);
    console.log(`[${source}] Parsed context:`, parsed);

    setContext(parsed);
    
    // If we detect an active call but don't have full data, fetch it manually
    const hasCallId = !!parsed.callId;
    const isActive = parsed.isAnswered;
    const missingData = !parsed.projectId || !parsed.traceId;
    
    if (hasCallId && isActive && missingData && typeof window.zoomSdk !== 'undefined') {
      console.log('âš ï¸ Active call detected but missing data. Fetching full context...');
      setIsFetchingFullContext(true);
      setTimeout(async () => {
        try {
          const fullContext = await window.zoomSdk.getPhoneContext();
          console.log('ðŸ“ž Full context fetched:', fullContext);
          const reparsed = parsePhoneContext(fullContext);
          console.log('ðŸ“ž Reparsed context:', reparsed);
          setRawContext(fullContext);
          setContext(reparsed);
        } catch (e) {
          console.error('Failed to fetch full context:', e);
        } finally {
          setIsFetchingFullContext(false);
        }
      }, 1000); // Increased to 1 second
    }
  }, []);

  useEffect(() => {
    const initializeSDK = async () => {
      console.log('ðŸ” Checking for Zoom SDK...');
      console.log('  - window.zoomSdk exists:', typeof window.zoomSdk !== 'undefined');
      console.log('  - hostname:', window.location.hostname);
      console.log('  - import.meta.env.DEV:', import.meta.env.DEV);
      
      // Check if running in Zoom environment
      if (typeof window.zoomSdk === 'undefined') {
        console.warn('Zoom SDK not available. Checking if this is a development environment...');
        
        // Check if we're in development mode (localhost or dev build)
        const isDevelopment = import.meta.env.DEV || 
                             window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
          console.log('ðŸ”§ Development mode enabled with mock data');
          setDevelopmentMode(true);
          setSdkReady(true);
          // Small delay to show the UI transition
          setTimeout(() => {
            processContext(MOCK_CONTEXT, 'mock-data');
          }, 500);
        } else {
          setError('Zoom SDK not loaded. This app must be opened inside the Zoom client.');
        }
        return;
      }

      try {
        await window.zoomSdk.config({
          version: '0.16.14',
          capabilities: ['getRunningContext', 'getPhoneContext', 'onPhoneContext']
        });

        console.log('Zoom SDK configured successfully');
        setSdkReady(true);

        // Subscribe to phone context changes
        await window.zoomSdk.onPhoneContext((ctx: ZoomPhoneContext) => {
          processContext(ctx, 'onPhoneContext');
        });

        console.log('Subscribed to onPhoneContext');

        // Get initial context (handles "already active" scenario)
        try {
          const initialContext = await window.zoomSdk.getPhoneContext();
          processContext(initialContext, 'getPhoneContext(initial)');
        } catch (e) {
          console.warn('Initial getPhoneContext failed:', e);
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.error('SDK initialization error:', errorMsg);
        
        // Check if this is "not supported by this browser" - fall back to dev mode
        if (errorMsg.includes('not supported') || errorMsg.includes('browser')) {
          const isDevelopment = import.meta.env.DEV || 
                               window.location.hostname === 'localhost' ||
                               window.location.hostname === '127.0.0.1';
          
          if (isDevelopment) {
            console.log('ðŸ”§ SDK failed, enabling development mode with mock data');
            setDevelopmentMode(true);
            setSdkReady(true);
            setError(null); // Clear the error
            setTimeout(() => {
              processContext(MOCK_CONTEXT, 'mock-data');
            }, 500);
            return;
          }
        }
        
        setError(`SDK initialization failed: ${errorMsg}`);
      }
    };

    initializeSDK();
  }, [processContext]);

  return {
    context,
    rawContext,
    sdkReady,
    error,
    developmentMode,
    isFetchingFullContext
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    zoomSdk: any;
  }
}
