#!/bin/bash
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_ok() {
	echo -e "${GREEN}OK${NC}"
}

print_ng() {
	echo -e "${RED}NG${NC}"
}

curl -s -o /dev/null -w "%{http_code}" localhost:4242 | grep 200 > /dev/null \
	&& print_ok \
	|| print_ng
