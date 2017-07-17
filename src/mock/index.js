let rest = require('./rest')
let gql = require('./gql')

module.exports = {
  rest: ({data}) => {
    rest({data}).listen(81, () => console.log('info', 'Mock Rest API running on port', 81))
  },
  gql: ({data}) => {
    gql({data}).listen(81, 82, () => {
      console.log('info', 'Mock Rest API running on port', 82)
      console.log('info', 'Mock GQL API running on port', 81)
    })
  }
}
