const { AppError } = require('@nudj/library/errors')

module.exports = function rootEnum (props = {}) {
  let {
    name,
    values
  } = props
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
    name,
    values: values.reduce((valuesMap, value) => {
      valuesMap[value] = value
      return valuesMap
    }, {})
  }
}
