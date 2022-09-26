.POSIX:

version != jq --raw-output '.version' package.json

all: help

docker-build: ## build Docker image
	docker build .

docker-publish: ## build and publish Docker image
	docker build . -t gcr.io/hoprassociation/hopr-rpc-relay:v${version}
	docker push gcr.io/hoprassociation/hopr-rpc-relay:v${version}

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
