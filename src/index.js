require('envkey')
const rest = require('./rest')
const gql = require('./gql')
const { transaction, store: nosqlStore } = require('./gql/adaptors/arango')
const { store: sqlStore } = require('./gql/adaptors/mysql')

rest.listen(81, () => console.log('Rest API running on http://localhost:81/'))
gql({ transaction, sqlStore, nosqlStore }).listen(82, () => console.log('GQL API running on http://localhost:82/'))
