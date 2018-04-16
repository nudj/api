require('envkey')
const rest = require('./rest')
const gql = require('./gql')
const { transaction, store } = require('./gql/adaptors/arango')

rest.listen(81, () => console.log('Rest API running on http://localhost:81/'))
gql({ transaction, store }).listen(82, () => console.log('GQL API running on http://localhost:82/'))
