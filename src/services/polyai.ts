/**
 * PolyAI API Service
 * Handles fetching handoff state from PolyAI via Cloudflare Function proxy
 */

import { PolyAIResponse } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch handoff state from PolyAI API
 * Uses Cloudflare Function as proxy to keep API key secure
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

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(
          `API request failed: ${response.status} ${response.statusText} - ${
            errorData.error || JSON.stringify(errorData)
          }`
        );
      }

      const data: PolyAIResponse = await response.json();
      console.log('Successfully fetched handoff state:', data);
      return data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
        await sleep(RETRY_DELAY_MS);
      } else {
        throw new Error(
          `Failed to fetch handoff state after ${MAX_RETRIES} attempts: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  }

  // TypeScript needs this even though we throw in the loop
  throw new Error('Unexpected error in fetchHandoffState');
}
