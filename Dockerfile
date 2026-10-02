# Multi-stage Dockerfile for AI-Powered Resume Screening & Candidate Ranking System
FROM node:20-alpine AS base
WORKDIR /app

# Install build dependencies
COPY package*.json tsconfig.json vite.config.ts ./
RUN npm install

# Copy application source code
COPY . .

# Build frontend and production assets
RUN npm run build

# Expose server port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start full-stack server
CMD ["npm", "start"]
