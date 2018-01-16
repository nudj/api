const { AppError } = require('@nudj/library/errors')

module.exports = function rootEnum ({ name, values } = {}) {
  if (!name) throw new AppError('rootEnum requires a name')
  if (!values || !values.length) { throw new AppError('rootEnum requires some values') }
  return {
    typeDefs: `
      enum ${name} {
        ${values.join(`
        `)}
      }
    `,
    resolvers: {},
    values: values.reduce((valuesMap, value) => {
      valuesMap[value] = value
      return valuesMap
    }, {})
  }
}
