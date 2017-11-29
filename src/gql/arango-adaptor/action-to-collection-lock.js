module.exports = (action) => {
  if (!action) {
    throw new Error('No action supplied')
  }
  const collections = []
  const accumulator = ({ type }) => collections.push(type)
  const noop = () => {}
  const store = {
    create: accumulator,
    readOne: noop,
    readOneOrCreate: accumulator,
    readMany: noop,
    readAll: noop,
    update: accumulator,
    updateOrCreate: accumulator,
    delete: accumulator
  }
  action(store)
  return collections
}
