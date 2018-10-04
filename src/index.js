require('envkey')
const gql = require('./gql')
const { transaction, store } = require('./gql/adaptors/arango')

gql({ transaction, store }).listen(80, () => console.log('GQL API running on http://localhost/'))
