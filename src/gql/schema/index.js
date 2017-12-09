const { makeExecutableSchema } = require('graphql-tools')
const glob = require('glob')
const path = require('path')

const { mergeDefinitions } = require('../lib')
const requireFile = file => require(path.resolve(file))

const modules = glob.sync('./gql/schema/**/*.js', {
  ignore: './gql/schema/index.js'
}).map(requireFile)

const definitions = mergeDefinitions(...modules)

module.exports = makeExecutableSchema(definitions)
