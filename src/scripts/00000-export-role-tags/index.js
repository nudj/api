const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const { stringify } = require('csv')
const find = require('lodash/find')

const toCsvData = promisify(stringify)
const writeFile = promisify(fs.writeFile)

async function action ({ db }) {
  const rolesCollectionCursor = db.collection('roles')
  const allRolesCursor = await rolesCollectionCursor.all()
  const allRoles = await allRolesCursor.all()

  const roleTagsCollectionCursor = db.collection('roleTags')
  const allRoleTagsCursor = await roleTagsCollectionCursor.all()
  const allRoleTags = await allRoleTagsCursor.all()

  const tagsCollectionCursor = db.collection('tags')
  const allTagsCursor = await tagsCollectionCursor.all()
  const allTags = await allTagsCursor.all()

  const columns = {
    id: true,
    name: true
  }
  const data = allRoles.map(role => {
    const { id, name } = role
    const result = { id, name }
    allRoleTags.forEach(roleTag => {
      if (roleTag.role === id) {
        const tag = find(allTags, tag => tag.id === roleTag.tag).name
        const columnName = `tag${Object.keys(result).length - 1}`
        columns[columnName] = true
        result[columnName] = tag
      }
    })
    return result
  })

  const csvData = await toCsvData(data, {
    columns: Object.keys(columns),
    header: true
  })
  await writeFile(path.join(__dirname, 'role-tags.csv'), csvData)
}

module.exports = action
