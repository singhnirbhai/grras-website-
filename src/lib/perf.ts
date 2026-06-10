import { NextResponse } from "next/server";

/**
 * Measures the execution time of an asynchronous function.
 * @param label A label to identify the operation in logs
 * @param fn The asynchronous function to execute
 */
export async function measure<T>(
  label: string,
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = performance.now() - start;
  console.log(`⏱️ [Performance] "${label}" took ${durationMs.toFixed(2)}ms`);
  return { result, durationMs };
}

/**
 * Formats a Next.js JSON response with execution timing headers.
 * Adds 'Server-Timing' header for browser devtools.
 */
export function nextResponseWithTiming(
  data: any,
  timings: Record<string, number>,
  status = 200
) {
  const response = NextResponse.json(
    {
      ...data,
      _performance: Object.fromEntries(
        Object.entries(timings).map(([key, val]) => [key, `${val.toFixed(2)}ms`])
      ),
    },
    { status }
  );

  // Set Server-Timing header (standard for browser performance tab)
  const timingHeader = Object.entries(timings)
    .map(([key, val]) => `${key};dur=${val.toFixed(2)}`)
    .join(", ");
  
  response.headers.set("Server-Timing", timingHeader);
  return response;
}
