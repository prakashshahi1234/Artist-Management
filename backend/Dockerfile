# Use official Node.js image
FROM node:22

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy app files
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Start the application
CMD ["npm", "run", "dev"]
