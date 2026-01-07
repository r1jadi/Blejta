/**
 * Get the API URL for the current context
 * - Server-side (SSR): uses Docker service name or localhost
 * - Client-side: uses NEXT_PUBLIC_API_URL (localhost for browser)
 */
export function getApiUrl(): string {
  // For server-side rendering (in Docker), use the service name
  if (typeof window === 'undefined') {
    // Server-side: In Docker, use the service name 'backend'
    // Check if API_URL_SERVER is set (Docker environment)
    if (process.env.API_URL_SERVER) {
      return process.env.API_URL_SERVER
    }
    // Fallback: try service name (works in Docker network)
    // If not in Docker, this will fail and we'll use localhost
    return 'http://backend:7058'
  }
  // Client-side: use public env var (accessible from browser)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7058'
}
