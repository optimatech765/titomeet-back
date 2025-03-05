#!/bin/sh

# Run migrations before starting the app
yarn deploy-db:prod

# Start the NestJS application
yarn start:prod
