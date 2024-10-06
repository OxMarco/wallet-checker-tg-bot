# Use the official Node.js image as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/tgbot

# Copy package.json and package-lock.json (or yarn.lock if you use Yarn)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Transpile TypeScript to JavaScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 3333

# Define the command to run the app using the precompiled JavaScript
CMD [ "node", "dist/bot.js" ]
