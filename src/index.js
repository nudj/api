const rest = require('./rest')
const gql = require('./gql')
const arangoStoreAdaptor = require('./gql/arango-store-adaptor')

rest.listen(81, () => console.log('Rest running on http://localhost:81/'))
gql({
  storeAdaptor: arangoStoreAdaptor({ baseURL: 'http://db:8529/_db/nudj/_api' })
}).listen(82, () => console.log('GQL running on http://localhost:82/'))
