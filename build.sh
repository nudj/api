#!/bin/bash

docker build -t $1 --build-arg NPM_TOKEN=${NPM_TOKEN} -f ./Dockerfile.dev .

docker run --rm --entrypoint cat $1 /usr/src/yarn.lock > ./tmp/yarn.lock
if ! diff -q ./src/yarn.lock ./tmp/yarn.lock > /dev/null 2>&1; then
  echo "Saving yarn.lock"
  cp ./tmp/yarn.lock ./src/yarn.lock
fi
