# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application/project
RUN npm run build

# Expose the port that the application will run on
EXPOSE 7001

# Copy .env file
COPY .env .env

# Start the application
CMD ["npm", "start"]
