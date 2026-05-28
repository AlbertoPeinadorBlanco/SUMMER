# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the SvelteKit app
RUN npm run build

# --- Production Image ---
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the build output from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Start the Node.js server
CMD ["node", "build"]
