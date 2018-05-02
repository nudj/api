const { AppError } = require('@nudj/library/errors')

const handleErrors = require('./handle-errors')

module.exports = function nestedSingleViaEdge (props = {}) {
  let {
    fromType,
    toType,
    name,
    edgeCollection,
    toCollection,
    fromEdgePropertyName,
    toEdgePropertyName
  } = props
  if (!fromType) throw new AppError('nestedSingleViaEdge requires a fromType')
  if (!toType) throw new AppError('nestedSingleViaEdge requires a toType')
  if (!name) throw new AppError('nestedSingleViaEdge requires a name')
  if (!edgeCollection) throw new AppError('nestedSingleViaEdge requires a edgeCollection')
  if (!toCollection) throw new AppError('nestedSingleViaEdge requires a toCollection')
  if (!fromEdgePropertyName) throw new AppError('nestedSingleViaEdge requires a fromEdgePropertyName')
  if (!toEdgePropertyName) throw new AppError('nestedSingleViaEdge requires a toEdgePropertyName')

  return {
    typeDefs: `
      extend type ${fromType} {
        ${name}: ${toType}
      }
    `,
    resolvers: {
      [fromType]: {
        [name]: handleErrors(async (from, args, context) => {
          const edge = await context.sql.readOne({
            type: edgeCollection,
            filters: {
              [fromEdgePropertyName]: from.id
            }
          })
          if (edge) {
            return context.sql.readOne({
              type: toCollection,
              id: edge[toEdgePropertyName]
            })
          } else {
            return null
          }
        })
      }
    }
  }
}
