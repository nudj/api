let rest = require('./rest')
let gql = require('./gql')

module.exports = {
  rest: ({ data, addCustomHandlers }) => {
    rest({ data, addCustomHandlers }).listen(81, () => console.log('info', 'Mock Rest API running on port', 81))
  },
  gql: ({ data, addCustomHandlers }) => {
    gql({ data, addCustomHandlers }).listen(81, 82, () => {
      console.log('info', 'Mock Rest API running on port', 82)
      console.log('info', 'Mock GQL API running on port', 81)
    })
  }
}
