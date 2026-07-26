import time
from collections import defaultdict
from typing import Callable, Tuple

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class InMemoryRateLimiter:
    """
    Simple sliding-window rate limiter.
    Not suitable for multi-process deployments — use Redis in production.
    """

    def __init__(self, max_requests: int = 20, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._windows: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str) -> Tuple[bool, int]:
        now = time.time()
        cutoff = now - self.window_seconds
        self._windows[key] = [t for t in self._windows[key] if t > cutoff]

        if len(self._windows[key]) >= self.max_requests:
            retry_after = int(self._windows[key][0] + self.window_seconds - now)
            return False, retry_after

        self._windows[key].append(now)
        return True, 0


auth_limiter = InMemoryRateLimiter(max_requests=20, window_seconds=60)


def rate_limit(max_requests: int = 20, window_seconds: int = 60) -> Callable:
    """
    FastAPI middleware-compatible rate limiter.
    Use as a dependency or middleware.
    """
    limiter = InMemoryRateLimiter(max_requests=max_requests, window_seconds=window_seconds)

    async def middleware(request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        ok, retry_after = limiter.check(client_ip)
        if not ok:
            return JSONResponse(
                status_code=429,
                content={"detail": f"Rate limit exceeded. Retry after {retry_after}s."},
                headers={"Retry-After": str(retry_after)},
            )
        return await call_next(request)

    return middleware
