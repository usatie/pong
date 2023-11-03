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
	# Test building frontend
	docker compose -f compose.yml -f compose.dev.yml run frontend npm run build
	# Unit tests for backend
	docker compose -f compose.yml -f compose.dev.yml run backend yarn test
	# E2E tests for backend
	docker compose -f compose.yml -f compose.dev.yml run backend yarn test:e2e

.PHONY: e2e
e2e:
	./test.sh

.PHONY: dev
dev: build
	docker compose -f compose.yml -f compose.dev.yml up -d

.PHONY: prod
prod:
	docker system prune -f
	docker compose -f compose.yml -f compose.prod.yml build
	docker compose -f compose.yml -f compose.prod.yml up -d

.PHONY: fmt
fmt:
	npx prettier --write frontend backend/src

.PHONY: update
update:
	docker compose run frontend npx npm-check-updates -i
	docker compose run backend yarn upgrade-interactive
