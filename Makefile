IMAGE:=nudj/admin
IMAGEDEV:=nudj/admin-dev
CWD=$(shell pwd)

.PHONY: build ssh test

build:
	@docker build \
		-t $(IMAGEDEV) \
		--build-arg NPM_TOKEN=${NPM_TOKEN} \
		-f $(CWD)/Dockerfile.dev \
		.

ssh:
	-@docker rm -f admin-dev 2> /dev/null || true
	@docker run --rm -it \
		--add-host api:127.0.0.1 \
		--name admin-dev \
		-e NPM_TOKEN=${NPM_TOKEN} \
		-p 0.0.0.0:60:80 \
		-p 0.0.0.0:61:81 \
		-v $(CWD)/.zshrc:/root/.zshrc \
		-v $(CWD)/src/gql:/usr/src/gql \
		-v $(CWD)/src/lib:/usr/src/lib \
		-v $(CWD)/src/mocks:/usr/src/mocks \
		-v $(CWD)/src/rest:/usr/src/rest \
		-v $(CWD)/src/test:/usr/src/test \
		-v $(CWD)/src/.npmignore:/usr/src/.npmignore \
		-v $(CWD)/src/.npmrc:/usr/src/.npmrc \
		-v $(CWD)/src/nodemon.json:/usr/src/nodemon.json \
		-v $(CWD)/src/package.json:/usr/src/package.json \
		-v $(CWD)/src/readme.md:/usr/src/readme.md \
		$(IMAGEDEV) \
		/bin/zsh

test:
	-@docker rm -f admin-test 2> /dev/null || true
	@docker run --rm -it \
		--name admin-test \
		-v $(CWD)/src/gql:/usr/src/gql \
		-v $(CWD)/src/lib:/usr/src/lib \
		-v $(CWD)/src/mocks:/usr/src/mocks \
		-v $(CWD)/src/rest:/usr/src/rest \
		-v $(CWD)/src/test:/usr/src/test \
		$(IMAGEDEV)
