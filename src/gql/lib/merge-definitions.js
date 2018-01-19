const { merge } = require('@nudj/library')

module.exports = function mergeDefinitions (...definitions) {
  let typeDefs = []
  let resolvers = {}
  definitions.forEach(def => {
    typeDefs = typeDefs.concat(def.typeDefs || [])
    resolvers = merge(resolvers, def.resolvers || {})
  })
  return { typeDefs, resolvers }
}
