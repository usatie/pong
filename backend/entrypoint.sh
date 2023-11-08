#!/bin/bash

yarn prisma migrate deploy
yarn prisma db seed
exec "$@"
