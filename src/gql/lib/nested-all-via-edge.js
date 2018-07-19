const { AppError } = require('@nudj/library/errors')

module.exports = function nestedAllViaEdge (props = {}) {
  let {
    fromType,
    toType,
    name,
    edgeCollection,
    toCollection,
    fromEdgePropertyName,
    toEdgePropertyName
  } = props
  if (!fromType) { throw new AppError('nestedAllViaEdge requires a fromType') }
  if (!toType) throw new AppError('nestedAllViaEdge requires a toType')
  if (!name) throw new AppError('nestedAllViaEdge requires a name')
  if (!edgeCollection) throw new AppError('nestedAllViaEdge requires a edgeCollection')
  if (!toCollection) throw new AppError('nestedAllViaEdge requires a toCollection')
  if (!fromEdgePropertyName) throw new AppError('nestedAllViaEdge requires a fromEdgePropertyName')
  if (!toEdgePropertyName) throw new AppError('nestedAllViaEdge requires a toEdgePropertyName')

  return {
    typeDefs: `
      extend type ${fromType} {
        ${name}: [${toType}!]!
      }
    `,
    resolvers: {
      [fromType]: {
        [name]: async (from, args, context) => {
          const edges = await context.store.readAll({
            type: edgeCollection,
            filters: {
              [fromEdgePropertyName]: from.id
            }
          })
          if (edges.length) {
            return context.store.readMany({
              type: toCollection,
              ids: edges.map(edge => edge[toEdgePropertyName])
            })
          } else {
            return []
          }
        }
      }
    }
  }
}
