FROM node:24-alpine AS builder

RUN apk update && apk upgrade
RUN apk add --no-cache git

WORKDIR /app
COPY frontend/ ./

ARG VITE_APP_NAME ${VITE_APP_NAME}
ARG VITE_APP_VERSION ${VITE_APP_VERSION}

RUN yarn --cwd frontend install
RUN yarn --cwd frontend build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY etc/docker/nginx.conf /etc/nginx/
EXPOSE 80