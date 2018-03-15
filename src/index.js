require('envkey')
const rest = require('./rest')
const gql = require('./gql')
const { transaction, store } = require('./gql/adaptors/arango')

rest.listen(81, () => console.log('Rest running on http://localhost:81/'))
gql({ transaction, store }).listen(82, () => console.log(`${process.env.USE_NEW_API === 'true' ? 'New' : 'Old'} GQL running on http://localhost:82/`))
