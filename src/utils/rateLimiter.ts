
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const keyRequests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = keyRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(key, validRequests);
    
    // Check if we're within the limit
    if (validRequests.length >= config.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    return true;
  }

  getWaitTime(key: string, config: RateLimitConfig): number {
    const keyRequests = this.requests.get(key);
    if (!keyRequests || keyRequests.length === 0) return 0;
    
    const oldestRequest = keyRequests[0];
    const waitTime = config.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, waitTime);
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Common rate limit configurations
export const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  API_CALLS: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 calls per minute
  INTEGRATION_SAVE: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 saves per minute
};
