FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy the entire frontend directory
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Run the Next.js app
CMD ["npm", "start"]
