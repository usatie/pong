FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn install && yarn prisma generate

COPY . .

RUN yarn build
