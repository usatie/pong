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

.PHONY: clean
clean:
	docker compose down --rmi all --volumes --remove-orphans

.PHONY: test
test:
	# E2E tests
	./test.sh
	# Unit tests for backend
	docker compose run --rm --no-deps backend "yarn" "test"
