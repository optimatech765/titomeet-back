#!/bin/sh
set -e

# Sync Prisma schema (just in case)
yarn sync-schema

# Run migrations
yarn deploy-db:prod

# Start the app
yarn start:prod
