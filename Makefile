.PHONY: all
all: up

.PHONY: re
re: down build up

.PHONY: up
up:
	docker compose up -d

.PHONY: down
down:
	docker compose down

.PHONY: build
build:
	docker compose build

.PHONY: rebuild
rebuild:
	docker compose build --no-cache

.PHONY: clean
clean:
	docker compose down --rmi all --volumes --remove-orphans

.PHONY: test
test: build
	# Unit tests for backend
	docker compose -f compose.yml -f compose.dev.yml run backend sh -c "yarn test"
	# E2E tests for backend
	docker compose -f compose.yml -f compose.dev.yml run backend sh -c "yarn test:e2e"

.PHONY: e2e
e2e:
	./test.sh

.PHONY: dev
dev: build
	docker compose -f compose.yml -f compose.dev.yml up -d

.PHONY: prod
prod: rebuild
	docker compose -f compose.yml -f compose.prod.yml up -d

.PHONY: fmt
fmt:
	npx prettier --write frontend/src backend/src
