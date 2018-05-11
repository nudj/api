/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { parse } = require('csv')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const find = require('lodash/find')

const readFile = promisify(fs.readFile)
const parseCsv = promisify(parse)

const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')
const script = require('../../../../scripts/00001-export-role-tags')
const executeScript = () => script({ db })

chai.use(chaiAsPromised)

describe('00001 Export Role Tags', () => {
  let result

  before(async () => {
    await setupCollections(db, [
      'roles',
      'roleTags',
      'tags'
    ])
  })

  beforeEach(async () => {
    await populateCollections(db, [
      {
        name: 'roles',
        data: [
          {
            _key: 'role1',
            name: 'Role One'
          },
          {
            _key: 'role2',
            name: 'Role Two'
          }
        ]
      },
      {
        name: 'roleTags',
        data: [
          {
            _key: 'roleTag1',
            role: 'role1',
            tag: 'tag1'
          },
          {
            _key: 'roleTag2',
            role: 'role1',
            tag: 'tag2'
          }
        ]
      },
      {
        name: 'tags',
        data: [
          {
            _key: 'tag1',
            name: 'Tag One'
          },
          {
            _key: 'tag2',
            name: 'Tag Two'
          }
        ]
      }
    ])
    await executeScript()
    const csv = await readFile(path.join(__dirname, '../../../../scripts/00001-export-role-tags/role-tags.csv'))
    result = await parseCsv(csv)
  })

  afterEach(async () => {
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  it('should write result to CV', async () => {
    expect(result).to.not.be.null()
  })

  it('should write a row for each role', async () => {
    expect(result).to.have.length(3)
  })

  it('should write the column titles', async () => {
    expect(result[0]).to.deep.equal([
      '_key',
      'name',
      'tag1',
      'tag2'
    ])
  })

  it('should write the role _key and role name in the first two columns', async () => {
    const roleOneRow = find(result, row => row[0] === 'role1')
    expect(roleOneRow[1]).to.equal('Role One')
    const roleTwoRow = find(result, row => row[0] === 'role2')
    expect(roleTwoRow[1]).to.equal('Role Two')
  })

  it('should write the role tags into the role row', async () => {
    const roleOneRow = find(result, row => row[0] === 'role1')
    expect(roleOneRow).to.contain('Tag One')
    expect(roleOneRow).to.contain('Tag Two')
  })

  it('should write empty strings where roles do not have that many tags', async () => {
    const roleTwoRow = find(result, row => row[0] === 'role2')
    expect(roleTwoRow[2]).to.equal('')
    expect(roleTwoRow[3]).to.equal('')
  })
})
