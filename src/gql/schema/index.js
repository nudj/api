const { makeExecutableSchema } = require('graphql-tools')
const glob = require('glob')
const path = require('path')

const mergeDefinitions = require('../lib/merge-definitions')
const requireFile = file => require(path.resolve(__dirname, file))

const modules = glob.sync('./**/*.js', {
  ignore: './index.js',
  cwd: __dirname
}).map(requireFile)

const definitions = mergeDefinitions(...modules)

module.exports = makeExecutableSchema(definitions)
