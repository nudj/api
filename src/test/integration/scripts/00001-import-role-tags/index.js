/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const path = require('path')
const fs = require('fs')
const orderBy = require('lodash/orderBy')

const {
  db,
  setupCollections,
  populateCollections,
  truncateCollections,
  teardownCollections,
  expect
} = require('../../lib')

const { fetchRoleTagData } = require('../../../../scripts/lib')

const script = require('../../../../scripts/00001-import-role-tags')
const getFullPathFor = relativePath => path.join(__dirname, relativePath)
const importCsvPath = getFullPathFor('../../../../scripts/00001-import-role-tags/role-tags.csv')

chai.use(chaiAsPromised)

describe('00001 Import Role Tags', () => {
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
  })

  afterEach(async () => {
    fs.unlinkSync(importCsvPath)
    await truncateCollections(db)
  })

  after(async () => {
    await teardownCollections(db)
  })

  it('should create new tagRoles', async () => {
    fs.copyFileSync(getFullPathFor('001-create-role-tag.csv'), importCsvPath)
    await script({ db })
    const { roleTags } = await fetchRoleTagData(db)
    expect(roleTags).to.have.length(2)
    const orderedRoleTags = orderBy(roleTags, ['tag'])
    expect(orderedRoleTags[0]).to.have.property('role', 'role1')
    expect(orderedRoleTags[0]).to.have.property('tag', 'tag1')
    expect(orderedRoleTags[1]).to.have.property('role', 'role1')
    expect(orderedRoleTags[1]).to.have.property('tag', 'tag2')
  })

  it('should remove missing tagRoles', async () => {
    fs.copyFileSync(getFullPathFor('002-remove-role-tag.csv'), importCsvPath)
    await script({ db })
    const { roleTags } = await fetchRoleTagData(db)
    expect(roleTags).to.have.length(0)
  })

  describe('when bad role id provided', () => {
    it('should throw', async () => {
      fs.copyFileSync(getFullPathFor('003-bad-role-id.csv'), importCsvPath)
      await expect(script({ db })).to.be.rejectedWith('Bad role id provided: 123')
    })
  })

  describe('when bad tag name provided', () => {
    it('should throw', async () => {
      fs.copyFileSync(getFullPathFor('004-bad-tag-name.csv'), importCsvPath)
      await expect(script({ db })).to.be.rejectedWith('Bad tag name (badtag) provided for role (role1)')
    })
  })

  describe('when a create and a remove action is applied to the same role', () => {
    it('should throw', async () => {
      fs.copyFileSync(getFullPathFor('005-create-remove.csv'), importCsvPath)
      await script({ db })
      const { roleTags } = await fetchRoleTagData(db)
      expect(roleTags).to.have.length(1)
      expect(roleTags[0]).to.have.property('role', 'role1')
      expect(roleTags[0]).to.have.property('tag', 'tag2')
    })
  })
})
