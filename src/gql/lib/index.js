const { merge } = require('@nudj/library')

function definitionMerger (...definitions) {
  let typeDefs = []
  let resolvers = {}
  definitions.forEach((def) => {
    typeDefs = typeDefs.concat(def.typeDefs)
    resolvers = merge(resolvers, def.resolvers)
  })
  return { typeDefs, resolvers }
}

module.exports = {
  definitionMerger
}
