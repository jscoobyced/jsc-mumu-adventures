ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS builder

# Install dependencies
RUN apk update && apk upgrade
RUN apk add --no-cache git libc6-compat build-base python3

# Install corepack and set yarn to stable version
RUN corepack enable
RUN yarn set version stable

WORKDIR /app

# Build frontend
COPY frontend/ ./

ARG VITE_APP_NAME ${VITE_APP_NAME}
ARG VITE_APP_VERSION ${VITE_APP_VERSION}

RUN yarn --cwd frontend install
RUN yarn --cwd frontend build

# Production image
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY etc/docker/nginx.conf /etc/nginx/
EXPOSE 80