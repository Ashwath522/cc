FROM node:20-alpine as builder

RUN apk update && apk upgrade --no-cache
RUN apk add python3-dev make alpine-sdk gcc g++ git build-base openssh openssl bash

# Install system dependencies required by Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

WORKDIR /srv/groot

COPY ./package.json .
COPY ./package-lock.json .
RUN rm -rf ./node_modules \
    && npm cache clean --force \
    && npm install

COPY . .

WORKDIR /srv/groot/platform
COPY ./platform/package.json ./platform
COPY ./platform/package-lock.json ./platform
RUN rm -rf ./node_modules \
    && npm cache clean --force \
    && npm install --build-from-source

RUN npm run build
RUN rm -rf ./node_modules package.json package-lock.json


# ----------------------------
# Runtime Image
# ----------------------------
FROM node:20-alpine

RUN apk update && apk upgrade --no-cache

# Install Chromium runtime dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

WORKDIR /srv/groot
COPY --from=builder /srv/groot /srv/groot

# ✅ Environment variables for Puppeteer (no trailing backslash!)
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

# Optional debug info
RUN apk list --installed | grep -E "libcrypto3|libssl3" || true
RUN apk info -r libssl3 || true
RUN apk info -r libcrypto3 || true

ENTRYPOINT ["node", "index.js", "--env", "production"]
