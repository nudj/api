IMAGE:=nudj/api
IMAGEDEV:=nudj/api-dev

CWD=$(shell pwd)
BIN:=./node_modules/.bin

.PHONY: build buildDev run dev test tdd

build:
	@docker build \
		-t $(IMAGE) \
		--build-arg NPM_TOKEN=${NPM_TOKEN} \
		.

push:
	@docker push $(IMAGE):latest

buildDev:
	@docker build \
		-t $(IMAGEDEV) \
		-f $(CWD)/Dockerfile.dev \
		--build-arg NPM_TOKEN=${NPM_TOKEN} \
		.

run:
	@docker run -it --rm \
		--name web \
		-p 0.0.0.0:81:81 \
		$(IMAGE)
	@echo 'App running on http://localhost:81/'

cache:
	-@docker rm -f dev-cache 2> /dev/null || true
	@docker run --rm -it \
		--name dev-cache \
		-v $(CWD)/.cache:/usr/src/.cache \
		$(IMAGEDEV) \
		/bin/sh -c 'cp -R /tmp/node_modules/. .cache/'

dev:
	-@docker rm -f dev-container 2> /dev/null || true
	@docker run --rm -it \
		--name dev-container \
		-p 0.0.0.0:81:81 \
		-v $(CWD)/src/gql:/usr/src/gql \
		-v $(CWD)/src/lib:/usr/src/lib \
		-v $(CWD)/src/test:/usr/src/test \
		$(IMAGEDEV) \
		/bin/sh -c 'ln -s /tmp/node_modules ./node_modules && $(BIN)/nodemon \
			--config nodemon.json \
			-e js \
			--quiet \
			--watch ./ \
			--delay 250ms \
			-x "node ."'

playground:
	-@docker rm -f dev-container 2> /dev/null || true
	@docker run --rm -it \
		--name dev-container \
		-p 0.0.0.0:91:81 \
		-p 0.0.0.0:92:82 \
		-v $(CWD)/src/gql:/usr/src/gql \
		-v $(CWD)/src/lib:/usr/src/lib \
		-v $(CWD)/src/mock:/usr/src/mock \
		$(IMAGEDEV) \
		/bin/sh -c 'ln -s /tmp/node_modules ./node_modules && $(BIN)/nodemon \
			--config nodemon.json \
			-e js \
			--quiet \
			--watch ./ \
			--delay 250ms \
			-x "node ./mock/run"'

test:
	-@docker rm -f test-container 2> /dev/null || true
	@docker run --rm -it \
		--name test-container \
		-v $(CWD)/src/lib:/usr/src/lib \
		-v $(CWD)/src/test:/usr/src/test \
		$(IMAGEDEV)

tdd:
	-@docker rm -f tdd-container 2> /dev/null || true
	@docker run --rm -it \
		--name tdd-container \
		-v $(CWD)/src/lib:/usr/src/lib \
		-v $(CWD)/src/test:/usr/src/test \
		$(IMAGEDEV) \
		/bin/sh -c 'ln -s /tmp/node_modules ./node_modules && $(BIN)/nodemon \
			--quiet \
			--watch ./ \
			--delay 250ms \
			-x "$(BIN)/standard && $(BIN)/mocha --recursive test || exit 1"'
