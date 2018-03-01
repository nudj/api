/* eslint-env mocha */
const chai = require('chai')
const uniq = require('lodash/uniq')
const expect = chai.expect

const generateConnectionImportIds = require('../../../../gql/lib/hash/generate-connection-import-ids')

describe('generateConnectionImportIds', () => {
  it('generates relevant ids for connection data', () => {
    const importedConnection = {
      firstName: 'Dave',
      lastName: 'McTest',
      email: 'dave@email.com',
      company: 'Dave & Co.',
      title: 'Head of Dave'
    }
    const from = 'person1'
    const {
      companyId,
      connectionId,
      personId,
      roleId
    } = generateConnectionImportIds(importedConnection, from)

    const ids = [ companyId, connectionId, personId, roleId ]

    expect(companyId).to.exist()
    expect(companyId).to.be.a('string')
    expect(connectionId).to.exist()
    expect(connectionId).to.be.a('string')
    expect(roleId).to.exist()
    expect(roleId).to.be.a('string')
    expect(personId).to.exist()
    expect(personId).to.be.a('string')
    expect(uniq(ids)).to.deep.equal(ids)
  })

  it('generates null for missing optional fields', () => {
    const importedConnection = {
      firstName: 'Dave',
      lastName: 'McTest',
      email: 'dave@email.com'
    }
    const from = 'person1'
    const {
      companyId,
      connectionId,
      personId,
      roleId
    } = generateConnectionImportIds(importedConnection, from)

    expect(connectionId).to.exist()
    expect(connectionId).to.be.a('string')
    expect(personId).to.exist()
    expect(personId).to.be.a('string')
    expect(companyId).to.be.null()
    expect(roleId).to.be.null()
  })

  it('throws if `from` relation is not provided', () => {
    const importedConnection = {
      firstName: 'Dave',
      lastName: 'McTest',
      email: 'dave@email.com'
    }

    expect(() => generateConnectionImportIds(importedConnection, null))
      .to.throw('Connection relation missing')
  })

  it('throws if connection has missing email field', () => {
    const badConnection = {
      firstName: 'Dave',
      lastName: 'McTest'
    }
    const from = 'person1'

    expect(() => generateConnectionImportIds(badConnection, from))
      .to.throw('Invalid connection')
  })
})
