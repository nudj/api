# API

nudj api and mock api

## API
Not used as a package. Please use the [docker image](https://hub.docker.com/r/nudj/api/) instead.

## Mock API

Useful during development and testing. Choose either the basic rest api or the new graphql fronted mock.

```
const mock = require('@nudj/api/mock')

// json-server powered rest api
mock.rest({data}).listen(81, () => console.log('Mock api running on port', 81))

// graphql powered mock api with json-server for data persistence
mock.gql({data}).listen(81, 82, () => console.log('Mock gql running on port', 81, 'with the rest backend running on port', 82))
```
