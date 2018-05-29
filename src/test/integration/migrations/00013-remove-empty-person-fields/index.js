/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const orderBy = require('lodash/orderBy')
const uniq = require('lodash/uniq')
const find = require('lodash/find')
const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const migration = require('../../../../migrations/00013-remove-unused-person-fields')
const { fetchAll } = require('../../../../lib')

chai.use(chaiAsPromised)

describe.only('00013 Remove Empty `Person` fields', () => {
  const executeMigration = ({ direction }) => {
    return migration[direction]({
      db,
      step: (description, actions) => actions()
    })
  }

  beforeEach(async () => {
    await setupCollections(db, ['people'])
    await populateCollections(db, [
      {
        name: 'people',
        data: [
          {
            _key: 'person1',
            firstName: 'Dave',
            title: ''
          },
          {
            _key: 'person2',
            firstName: 'Fred',
            status: '',
            title: ''
          },
          {
            _key: 'person3',
            firstName: 'Steve',
            company: ''
          },
          {
            _key: 'person4',
            company: '',
            type: '',
            firstName: 'Zach',
            status: ''
          },
          {
            _key: 'person5',
            firstName: 'Jack',
            lastName: ''
          },
          {
            _key: 'person6',
            firstName: 'Gavin',
            type: ''
          },
          {
            _key: 'person7',
            firstName: 'Theodore',
            status: ''
          },
        ]
      }
    ])
    await executeMigration({ direction: 'up' })
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  it('should remove empty `title`, `status`, `company` & `type` fields', async () => {
    const people = orderBy(await fetchAll(db, 'people'), '_key')

    expect(people[0]).to.have.property('_key').to.equal('person1')
    expect(people[0]).to.not.have.property('title')

    expect(people[1]).to.have.property('_key').to.equal('person2')
    expect(people[1]).to.not.have.property('title')
    expect(people[1]).to.not.have.property('status')

    expect(people[2]).to.have.property('_key').to.equal('person3')
    expect(people[2]).to.not.have.property('company')

    expect(people[3]).to.have.property('_key').to.equal('person4')
    expect(people[3]).to.not.have.property('company')
    expect(people[3]).to.not.have.property('type')
    expect(people[3]).to.not.have.property('status')

    expect(people[5]).to.have.property('_key').to.equal('person6')
    expect(people[5]).to.not.have.property('type')

    expect(people[6]).to.have.property('_key').to.equal('person7')
    expect(people[6]).to.not.have.property('status')
  })

  it('should not update people without affected fields', async () => {
    const people = orderBy(await fetchAll(db, 'people'), '_key')

    const normalisedPerson = people[4]

    expect(normalisedPerson).to.have.property('_key').to.equal('person5')
    expect(normalisedPerson).to.have.property('firstName').to.equal('Jack')
    expect(normalisedPerson).to.have.property('lastName').to.equal('')
  })
})
