# API Gateway
The system is built on a modern stack using Redis for high-speed counter management and MongoDB for persistent data storage. It integrates Prometheus for real-time metrics collection, providing deep insights into traffic patterns and system health.

### Architecture
**API Service**: The core application handling business logic and client requests.
**Rate Limiter Service**: A specialized module that intercepts requests to enforce rate limits (Fixed Window/Sliding Window) using Redis, preventing abuse and ensuring fair usage.
**Redis**: utilized as a high-throughput, low-latency store for tracking real-time request counts and rate limit windows.
**MongoDB**: Serves as the primary persistent database for user data and application state.
**Prometheus**: Scrapes metrics from the services to monitor request rates, latency, and rate-limiting events.

### Tech Stack
**Runtime**: Node.js / TypeScript
**Database**: MongoDB
**Caching/KV Store**: Redis
**Observability**: Prometheus
**Testing**: Vitest
