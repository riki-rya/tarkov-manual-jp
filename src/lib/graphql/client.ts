import { GraphQLClient } from "graphql-request";

const ENDPOINT = "https://api.tarkov.dev/graphql";
const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY = 1000; // 1 second between requests

let lastRequestTime = 0;

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_DELAY - elapsed)
    );
  }
  lastRequestTime = Date.now();
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await waitForRateLimit();
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(
        `Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

const client = new GraphQLClient(ENDPOINT, {
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  return retryWithBackoff(() => client.request<T>(query, variables));
}

export { client };
