const { AppError } = require('@nudj/library/errors')
const filter = require('lodash/filter')

module.exports = function nestedAllByFiltersViaEdge (props = {}) {
  let {
    fromType,
    toType,
    name,
    edgeCollection,
    toCollection,
    fromEdgePropertyName,
    toEdgePropertyName,
    filterType
  } = props
  if (!fromType) { throw new AppError('nestedAllByFiltersViaEdge requires a fromType') }
  if (!toType) throw new AppError('nestedAllByFiltersViaEdge requires a toType')
  if (!name) throw new AppError('nestedAllByFiltersViaEdge requires a name')
  if (!edgeCollection) throw new AppError('nestedAllByFiltersViaEdge requires a edgeCollection')
  if (!toCollection) throw new AppError('nestedAllByFiltersViaEdge requires a toCollection')
  if (!fromEdgePropertyName) throw new AppError('nestedAllByFiltersViaEdge requires a fromEdgePropertyName')
  if (!toEdgePropertyName) throw new AppError('nestedAllByFiltersViaEdge requires a toEdgePropertyName')
  if (!filterType) throw new AppError('nestedAllByFiltersViaEdge requires a filterType')

  return {
    typeDefs: `
      extend type ${fromType} {
        ${name}(filters: ${filterType}): [${toType}!]!
      }
    `,
    resolvers: {
      [fromType]: {
        [name]: async (from, args, context) => {
          const edges = await context.sql.readAll({
            type: edgeCollection,
            filters: {
              [fromEdgePropertyName]: from.id
            }
          })
          if (edges.length) {
            const items = await context.sql.readMany({
              type: toCollection,
              ids: edges.map(edge => edge[toEdgePropertyName])
            })
            return filter(items, args.filters)
          } else {
            return []
          }
        }
      }
    }
  }
}
