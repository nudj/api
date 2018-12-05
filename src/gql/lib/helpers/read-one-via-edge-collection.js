const find = require('lodash/find')
const some = require('lodash/some')

async function readOneViaEdgeCollection ({
  type,
  edge,
  store,
  fromPropertyName,
  toPropertyName,
  fromData,
  filters
}) {
  if (!type) throw new Error('readOneViaEdgeCollection requires a type')
  if (!edge) throw new Error('readOneViaEdgeCollection requires an edge')
  if (!store) throw new Error('readOneViaEdgeCollection requires a store')
  if (!fromPropertyName) throw new Error('readOneViaEdgeCollection requires a fromPropertyName')
  if (!toPropertyName) throw new Error('readOneViaEdgeCollection requires a toPropertyName')
  if (!fromData) throw new Error('readOneViaEdgeCollection requires a fromData')

  const [ edges, filteredItems ] = await Promise.all([
    store.readAll({
      type: edge,
      filters: {
        [fromPropertyName]: fromData.id
      }
    }),
    store.readAll({ type, filters })
  ])

  const match = find(filteredItems, filteredItem => {
    return some(edges, edge => {
      return edge[toPropertyName] === filteredItem.id
    })
  })

  return match || null
}

module.exports = readOneViaEdgeCollection
