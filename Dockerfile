# Use the official Node.js image as the base image
FROM node:20-alpine

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application code to the working directory
COPY . .

#Copy the .env file
COPY .env.example .env

# Run the deploy-db:prod script
RUN yarn deploy-db:prod

# Build the NestJS application
RUN yarn build

# Expose the port that the NestJS application will run on
EXPOSE 5000


# Copy the entry script and give execution permissions
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Command to run the entry script
CMD ["/entrypoint.sh"]