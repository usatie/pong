# pong

## Pre-requisites
- You must have [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- Edit `.env` file with your own configuration like this:
```
HOST_URL=http://localhost
NGINX_PORT=4242
FRONTEND_PORT=3000
BACKEND_PORT=3000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
```

## How to run the application
```
$ make
```

You can check the application running at http://localhost:4242

## How to test
```
$ make test
```

## Development
```
$ make dev
```
