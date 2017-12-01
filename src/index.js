const rest = require('./rest')
const gql = require('./gql')
const Transaction = require('./gql/arango-adaptor')

rest.listen(81, () => console.log('Rest running on http://localhost:81/'))
gql({
  transaction: Transaction({ baseURL: process.env.DB_API_URL })
}).listen(82, () => console.log('GQL running on http://localhost:82/'))
