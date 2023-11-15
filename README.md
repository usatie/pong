# pong

## Pre-requisites
- You must have [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- Edit `.env` file with your own configuration like this:
```
NGINX_PORT=4242
PUBLIC_API_URL=http://localhost:4242/api
PUBLIC_WEB_URL=http://localhost:4242
FRONTEND_PORT=3000
BACKEND_PORT=3000
JWT_SECRET=some_random_secret
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
some
long
private
key
-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
some
long
public
key
-----END PUBLIC KEY-----"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
```

## How to generate RSA keys
```
$ openssl genrsa -out private.pem 2048
$ openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

## How to run the application
```
$ make
```

You can check the application running at http://localhost:4242

## Seed the database
```
docker compose exec backend yarn prisma db seed
```

## How to test
```
$ make test
```

## Development
```
$ make dev
```
