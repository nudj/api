// /* eslint-env mocha */
//
// const chai = require('chai')
// const proxyquire = require('proxyquire').noCallThru()
// const sinon = require('sinon')
// const sinonChai = require('sinon-chai')
// const expect = chai.expect
//
// chai.use(sinonChai)
//
// const DOCUMENT_RESPONSE = { _key: 'id', '_id': 123, '_rev': 123, prop: 'value' }
//
// describe('ArangoAdaptor Store().search', () => {
//   let Store
//   let dbStub
//
//   before(() => {
//     dbStub = {
//       db: {
//         collectionName: {
//           all: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE, DOCUMENT_RESPONSE] }),
//           byExample: sinon.stub().returns({ toArray: () => [DOCUMENT_RESPONSE, DOCUMENT_RESPONSE] })
//         }
//       }
//     }
//     Store = proxyquire('../../../gql/adaptors/arango/store', {
//       '@arangodb': dbStub
//     })
//   })
//   afterEach(() => {
//     dbStub.db.collectionName.all.reset()
//     dbStub.db.collectionName.byExample.reset()
//   })
//
//   describe('with no filters', () => {
//     it('should fetch the data', () => {
//       return Store().readAll({
//         type: 'collectionName'
//       })
//       .then(() => {
//         expect(dbStub.db.collectionName.all).to.have.been.called()
//       })
//     })
//   })
// })
