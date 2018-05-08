const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv')
const filter = require('lodash/filter')
const find = require('lodash/find')
const differenceWith = require('lodash/differenceWith')
const { generateId } = require('@nudj/library')

const { fetchRoleTagData } = require('../lib')

const readFile = promisify(fs.readFile)
const parseCsv = promisify(parse)

async function action ({ db }) {
  const currentData = await fetchRoleTagData(db)
  const allRoleKeys = []
  const currentRoleTagTagMap = currentData.roles.reduce((currentRoleTagTagMap, role) => {
    const roleTags = filter(currentData.roleTags, roleTag => roleTag.role === role._key)
    const roleTagTags = roleTags.map(roleTag => {
      roleTag.tag = find(currentData.tags, tag => tag._key === roleTag.tag)
      return roleTag
    })
    currentRoleTagTagMap[role._key] = roleTagTags
    allRoleKeys.push(role._key)
    return currentRoleTagTagMap
  }, {})

  const csvData = await readFile(path.join(__dirname, 'role-tags.csv'))
  const data = await parseCsv(csvData)
  const roleRows = data.slice(1)

  const diff = roleRows.reduce((diff, roleRow) => {
    const [ id, , ...newTagData ] = roleRow
    if (!allRoleKeys.includes(id)) throw new Error(`Bad role id provided: ${id}`)
    const newTagNames = newTagData.reduce((newTagNames, tagName) => {
      if (tagName.length) {
        newTagNames.push(tagName)
      }
      return newTagNames
    }, [])
    const currentRoleTagTags = currentRoleTagTagMap[id]
    const create = differenceWith(newTagNames, currentRoleTagTags, (newTagName, currentRoleTagTag) => {
      return currentRoleTagTag.tag.name === newTagName
    }).map(newTagName => {
      const tag = find(currentData.tags, tag => tag.name === newTagName)
      if (!tag) throw new Error(`Bad tag name (${newTagName}) provided for role (${id})`)
      return {
        _key: generateId(),
        role: id,
        tag: tag._key
      }
    })
    const remove = differenceWith(currentRoleTagTags, newTagNames, (currentRoleTagTag, newTagName) => {
      return currentRoleTagTag.tag.name === newTagName
    }).map(roleTagTag => roleTagTag._key)
    diff.create = diff.create.concat(create)
    diff.remove = diff.remove.concat(remove)
    return diff
  }, {
    create: [],
    remove: []
  })

  const roleTagsCollectionCursor = db.collection('roleTags')
  if (diff.create.length) {
    await roleTagsCollectionCursor.import(diff.create)
  }
  if (diff.remove.length) {
    await roleTagsCollectionCursor.removeByKeys(diff.remove)
  }
}

module.exports = action
