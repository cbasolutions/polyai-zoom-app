/**
 * PolyAI API Service
 * Handles fetching handoff state from PolyAI via Cloudflare Function proxy
 */

import { PolyAIResponse } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const FETCH_TIMEOUT_MS = 10000; // 10 second timeout

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch handoff state from PolyAI API
 * Uses Cloudflare Function as proxy to keep API key secure
 * Includes timeout and retry logic for reliability
 */
export async function fetchHandoffState(
  projectId: string,
  sharedId: string
): Promise<PolyAIResponse> {
  console.log(`Fetching handoff state for project=${projectId}, sharedId=${sharedId}`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = `/api/poly/handoff_state?projectId=${encodeURIComponent(
        projectId
      )}&sharedId=${encodeURIComponent(sharedId)}`;

      console.log(`Attempt ${attempt}/${MAX_RETRIES}: ${url}`);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn(`Request timeout after ${FETCH_TIMEOUT_MS}ms`);
      }, FETCH_TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' })) as { error?: string } | any;
        const errorMessage = typeof errorData === 'object' && errorData !== null && 'error' in errorData
          ? errorData.error
          : JSON.stringify(errorData);
        
        throw new Error(
          `API request failed: ${response.status} ${response.statusText} - ${errorMessage}`
        );
      }

      const data: PolyAIResponse = await response.json();
      console.log('Successfully fetched handoff state:', data);
      return data;
    } catch (error) {
      // Check if error was due to abort (timeout)
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      const errorType = isTimeout ? 'timeout' : 'network error';
      
      console.error(`Attempt ${attempt} failed (${errorType}):`, error);

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
        await sleep(RETRY_DELAY_MS);
      } else {
        const baseMessage = `Failed to fetch handoff state after ${MAX_RETRIES} attempts`;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const hint = isTimeout 
          ? 'The request timed out. Check your network connection or try again.'
          : 'Check your network connection and PolyAI API configuration.';
        
        throw new Error(`${baseMessage}: ${errorMessage}. ${hint}`);
      }
    }
  }

  // TypeScript needs this even though we throw in the loop
  throw new Error('Unexpected error in fetchHandoffState');
}
