#!/bin/sh
set -e

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Run Prisma migrations
yarn deploy-db:prod

# Start the app
exec "$@"


# Start the NestJS application
yarn start:prod
