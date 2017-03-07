IMAGE:=nudj/api
IMAGEDEV:=nudj/api-dev

CWD=$(shell pwd)
BIN:=./node_modules/.bin

.PHONY: build buildDev run dev pack test tdd

build:
	@docker build -t $(IMAGE) .

buildDev:
	@docker build -t $(IMAGEDEV) -f $(CWD)/Dockerfile.dev .

run:
	@docker run -it --rm \
		--name web \
		-p 0.0.0.0:4001:3001 \
		$(IMAGE)
	@echo 'App running on http://localhost:4001/'

dev:
	-@docker rm -f dev-container 2> /dev/null || true
	@docker run --rm -it \
		--name dev-container \
		-p 0.0.0.0:3001:3001 \
		-v $(CWD)/src:/usr/www/src \
		$(IMAGEDEV) \
		$(BIN)/nodemon \
			--config src/nodemon.json \
			-e js \
			--quiet \
			--watch ./ \
			--delay 250ms \
			-x 'node .'

test:
	-@docker rm -f test-container 2> /dev/null || true
	@docker run --rm -it \
		--name test-container \
		-v $(CWD)/src:/usr/www/src \
		-v $(CWD)/test:/usr/www/test \
		$(IMAGEDEV)

tdd:
	-@docker rm -f test-container 2> /dev/null || true
	@docker run --rm -it \
		--name test-container \
		-v $(CWD)/src:/usr/www/src \
		-v $(CWD)/test:/usr/www/test \
		$(IMAGEDEV) \
		$(BIN)/nodemon \
			--quiet \
			--watch ./ \
			--delay 250ms \
			-x '$(BIN)/mocha test/*.js || exit 1'
