require('envkey')
const rest = require('./rest')
const gqlNew = require('./gql')
const gqlOld = require('./gql-old')
const transaction = require('./gql/adaptors/arango')

const gql = process.env.USE_NEW_API === 'true' ? gqlNew : gqlOld

rest.listen(81, () => console.log('Rest running on http://localhost:81/'))
gql({ transaction }).listen(82, () => console.log(`${process.env.USE_NEW_API === 'true' ? 'New' : 'Old'} GQL running on http://localhost:82/`))
