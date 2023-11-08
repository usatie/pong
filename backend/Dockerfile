FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn install && yarn prisma generate

COPY . .
RUN chmod +x ./entrypoint.sh && yarn build
ENTRYPOINT ["./entrypoint.sh"]
