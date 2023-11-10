#!/bin/bash

yarn prisma migrate deploy
yarn prisma generate
yarn prisma db seed
exec "$@"
