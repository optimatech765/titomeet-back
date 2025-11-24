FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies without triggering Prisma errors
RUN yarn install --ignore-scripts

# Copy the rest of the app
COPY . .

# Sync shared Prisma schema
RUN yarn sync-schema

# Run Prisma generate
RUN yarn prisma generate

# Build the app
RUN yarn build

# Expose and configure
EXPOSE 5000

# Copy entrypoint and set perms
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["yarn", "start:prod"]
