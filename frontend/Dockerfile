FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run in development mode with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]