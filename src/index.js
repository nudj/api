require('envkey')
const gql = require('./gql')
const { store: sqlStore } = require('./gql/adaptors/mysql')

gql({ sqlStore }).listen(80, () => console.log('GQL API running on http://localhost:80/'))
