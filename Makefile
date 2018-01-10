IMAGE:=nudj/api
IMAGEDEV:=nudj/api-dev
CWD=$(shell pwd)

.PHONY: build ssh test

build:
	@docker build \
		-t $(IMAGEDEV) \
		--build-arg NPM_TOKEN=${NPM_TOKEN} \
		-f $(CWD)/Dockerfile.dev \
		.

ssh:
	-@docker rm -f api-dev 2> /dev/null || true
	@docker run --rm -it \
		--env-file $(CWD)/.env \
		--name api-dev \
		-e NPM_TOKEN=${NPM_TOKEN} \
		-e DB_API_URL=http://localhost:81 \
		-p 0.0.0.0:60:80 \
		-p 0.0.0.0:61:81 \
		-p 0.0.0.0:62:82 \
		-v $(CWD)/.zshrc:/root/.zshrc \
		-v $(CWD)/src/gql:/usr/src/gql \
		-v $(CWD)/src/gql-old:/usr/src/gql-old \
		-v $(CWD)/src/lib:/usr/src/lib \
		-v $(CWD)/src/mock:/usr/src/mock \
		-v $(CWD)/src/rest:/usr/src/rest \
		-v $(CWD)/src/test:/usr/src/test \
		-v $(CWD)/src/.npmignore:/usr/src/.npmignore \
		-v $(CWD)/src/.npmrc:/usr/src/.npmrc \
		-v $(CWD)/src/nodemon.json:/usr/src/nodemon.json \
		-v $(CWD)/src/package.json:/usr/src/package.json \
		-v $(CWD)/src/readme.md:/usr/src/readme.md \
		-v $(CWD)/../library/src:/usr/src/@nudj/library \
		$(IMAGEDEV) \
		/bin/zsh

test:
	-@docker rm -f api-test 2> /dev/null || true
	@docker run --rm -it \
		--env-file $(CWD)/.env \
		--name api-test \
		-e ENVIRONMENT=test \
		-e DB_API_URL=http://localhost:81 \
		-v $(CWD)/src/gql:/usr/src/gql \
		-v $(CWD)/src/gql-old:/usr/src/gql-old \
		-v $(CWD)/src/lib:/usr/src/lib \
		-v $(CWD)/src/mock:/usr/src/mock \
		-v $(CWD)/src/rest:/usr/src/rest \
		-v $(CWD)/src/test:/usr/src/test \
		$(IMAGEDEV) \
		/bin/zsh -c './node_modules/.bin/standard && ./node_modules/.bin/mocha --recursive test'

standardFix:
	-@docker rm -f api-test 2> /dev/null || true
	@docker run --rm -it \
		--name api-test \
		-e ENVIRONMENT=test \
		-e DB_API_URL=http://localhost:81 \
		-v $(CWD)/src/gql:/usr/src/gql \
		-v $(CWD)/src/gql-old:/usr/src/gql-old \
		-v $(CWD)/src/lib:/usr/src/lib \
		-v $(CWD)/src/mock:/usr/src/mock \
		-v $(CWD)/src/rest:/usr/src/rest \
		-v $(CWD)/src/test:/usr/src/test \
		$(IMAGEDEV) \
		/bin/zsh -c './node_modules/.bin/standard --fix'
