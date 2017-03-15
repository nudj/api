IMAGE:=nudj/api
IMAGEDEV:=nudj/api-dev

CWD=$(shell pwd)
BIN:=./node_modules/.bin

.PHONY: build buildDev run dev test tdd

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
		-v $(CWD)/src/package.json:/usr/src/package.json \
		-v $(CWD)/src/lib:/usr/src/lib \
		$(IMAGEDEV) \
		$(BIN)/nodemon \
			--config nodemon.json \
			-e js \
			--quiet \
			--watch ./ \
			--delay 250ms \
			-x 'node .'

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
		$(BIN)/nodemon \
			--quiet \
			--watch ./ \
			--delay 250ms \
			-x '$(BIN)/standard && $(BIN)/mocha test/*.js || exit 1'
