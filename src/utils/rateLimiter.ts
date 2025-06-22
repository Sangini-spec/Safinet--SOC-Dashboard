
interface RateLimit {
  requests: number;
  windowMs: number;
}

export const RATE_LIMITS: Record<string, RateLimit> = {
  INTEGRATION_SAVE: { requests: 10, windowMs: 60000 }, // 10 requests per minute
  INTEGRATION_TEST: { requests: 5, windowMs: 60000 },  // 5 requests per minute
  API_CALL: { requests: 100, windowMs: 60000 }         // 100 requests per minute
};

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, limit: RateLimit): boolean {
    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const userRequests = this.requests.get(key)!;
    
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(key, validRequests);
    
    if (validRequests.length >= limit.requests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  getWaitTime(key: string, limit: RateLimit): number {
    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    if (!this.requests.has(key)) {
      return 0;
    }
    
    const userRequests = this.requests.get(key)!;
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length < limit.requests) {
      return 0;
    }
    
    const oldestRequest = Math.min(...validRequests);
    return (oldestRequest + limit.windowMs) - now;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    const maxAge = Math.max(...Object.values(RATE_LIMITS).map(limit => limit.windowMs));
    
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(timestamp => (now - timestamp) < maxAge);
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

setInterval(() => {
  rateLimiter.cleanup();
}, 60000); // Cleanup every minute
