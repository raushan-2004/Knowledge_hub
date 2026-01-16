FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY src ./src
COPY .env* ./

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
