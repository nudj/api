APP:=api
IMAGE:=nudj/$(APP)
IMAGEDEV:=nudj/$(APP):development
CWD=$(shell pwd)
DOCKERCOMPOSE:=docker-compose -p nudj

.PHONY: build buildLocal up ssh ui cmd down test

build:
	@./build.sh $(IMAGEDEV)

buildLocal:
	@docker build \
		-t $(IMAGE):local \
		--build-arg NODE_ENV=production \
		--build-arg NPM_TOKEN=${NPM_TOKEN} \
		-f $(CWD)/Dockerfile \
		.

up:
	@$(DOCKERCOMPOSE) up -d --force-recreate --no-deps $(APP)

ssh:
	@$(DOCKERCOMPOSE) exec $(APP) /bin/zsh

test:
	@$(DOCKERCOMPOSE) exec $(APP) /bin/zsh -c './node_modules/.bin/standard && ./node_modules/.bin/mocha --recursive test/unit'

down:
	@$(DOCKERCOMPOSE) rm -f -s $(APP)

integration:
	@$(DOCKERCOMPOSE) run --rm \
		-e NPM_TOKEN=${NPM_TOKEN} \
		-v $(CWD)/src/test:/usr/src/test \
		api \
		/bin/sh -c './node_modules/.bin/mocha --recursive ./test/integration || exit 1'

integrationTDD:
	@$(DOCKERCOMPOSE) run --rm \
		-e NPM_TOKEN=${NPM_TOKEN} \
		-v $(CWD)/src/test:/usr/src/test \
		api \
		/bin/sh -c './node_modules/.bin/nodemon \
  --config ./nodemon-tdd.json \
	--quiet \
	--watch ./ \
	--delay 250ms \
	-x "./node_modules/.bin/mocha --recursive ./test/integration || exit 1"'

standardFix:
	-@docker rm -f api-test 2> /dev/null || true
	@docker run --rm -it \
		--name api-test \
		-e ENVIRONMENT=test \
		-e DB_API_URL=http://localhost:81 \
		-v $(CWD)/src/gql:/usr/src/gql \
		-v $(CWD)/src/lib:/usr/src/lib \
		-v $(CWD)/src/rest:/usr/src/rest \
		-v $(CWD)/src/test:/usr/src/test \
		$(IMAGEDEV) \
		/bin/zsh -c './node_modules/.bin/standard --fix'
