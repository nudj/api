const { AppError } = require('@nudj/library/errors')
const some = require('lodash/some')

module.exports = function nestedSingleByFiltersViaEdge (props = {}) {
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
  if (!fromType) { throw new AppError('nestedSingleByFiltersViaEdge requires a fromType') }
  if (!toType) throw new AppError('nestedSingleByFiltersViaEdge requires a toType')
  if (!name) throw new AppError('nestedSingleByFiltersViaEdge requires a name')
  if (!edgeCollection) throw new AppError('nestedSingleByFiltersViaEdge requires a edgeCollection')
  if (!toCollection) throw new AppError('nestedSingleByFiltersViaEdge requires a toCollection')
  if (!fromEdgePropertyName) throw new AppError('nestedSingleByFiltersViaEdge requires a fromEdgePropertyName')
  if (!toEdgePropertyName) throw new AppError('nestedSingleByFiltersViaEdge requires a toEdgePropertyName')
  if (!filterType) throw new AppError('nestedSingleByFiltersViaEdge requires a filterType')

  return {
    typeDefs: `
      extend type ${fromType} {
        ${name}(filters: ${filterType}): ${toType}
      }
    `,
    resolvers: {
      [fromType]: {
        [name]: async (from, args, context) => {
          const [
            edges,
            filteredItem
          ] = await Promise.all([
            context.store.readAll({
              type: edgeCollection,
              filters: {
                [fromEdgePropertyName]: from.id
              }
            }),
            context.store.readOne({
              type: toCollection,
              filters: args.filters
            })
          ])
          if (filteredItem) {
            const match = some(edges, edge => edge[toEdgePropertyName] === filteredItem.id)
            return match ? filteredItem : null
          } else {
            return null
          }
        }
      }
    }
  }
}
