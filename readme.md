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

### Releasing

1. Pull latest from `origin/develop`
1. Increment `package.json` version and `codefresh.yml` tag
1. Commit the change with the commit message `Set [x.x.x]`
1. Push change onto `origin/develop`
1. Checkout to latest master
1. Merge latest develop into master using `git merge origin/develop --no-ff`, with the commit message of `Release [x.x.x]`
1. Push change onto `origin/master`
1. Tag the version using `git tag [x.x.x]`
1. Push the tag: `git push origin --tags`
1. Copy the release notes: `git --no-pager log [PREVIOUS_VERSION_TAG]..[NEW_VERSION_TAG] --pretty=format:'- %s %H ' --reverse --no-merges | pbcopy`
1. Put the release notes on the [relevant release on GitHub](https://github.com/nudj/api/releases)
