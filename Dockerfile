# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production=false

# Copy source code
COPY . .

# Build Next.js application with output tracing enabled
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Build Next.js application with output tracing enabled
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Install Python, yt-dlp dependencies, and su-exec
RUN apk add --no-cache python3 py3-pip ffmpeg su-exec

# Install yt-dlp
RUN pip3 install --no-cache-dir yt-dlp --break-system-packages

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create data directory for database
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

# Switch to root to allow permission fixes on startup
USER root

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create startup script that fixes permissions and starts the app
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'mkdir -p /app/data' >> /start.sh && \
    echo 'chown -R nextjs:nodejs /app/data' >> /start.sh && \
    echo 'su-exec nextjs node server.js' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
