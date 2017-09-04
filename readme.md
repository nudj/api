# API

Internal API for nudj data

[![Codefresh build status]( https://g.codefresh.io/api/badges/build?repoOwner=nudj&repoName=api&branch=master&pipelineName=api&accountName=collingo&key=eyJhbGciOiJIUzI1NiJ9.NThhZDVhYzdhOGU4YWUwMTAwMzQ4MTcz.LswrznCGW0BHHD1jCDCg-EWQm_-4_j0qwWCvUTZcCYA&type=cf-1)]( https://g.codefresh.io/repositories/nudj/api/builds?filter=trigger:build;branch:master;service:58beeff76c43a40100f9f561~api)

## Contributing

### Requirements

1. Docker
1. Make

### Outside container

1. `make build` to build the image
1. `make ssh` to ssh into container
1. `make test` to run the tests

### Development (Inside container)

1. `run` to run the app
1. `dev` to run the app with a watcher
1. `test` to run the tests
1. `tdd` to run the tests with a watcher
1. `exit` to leave the container and close the ssh session
