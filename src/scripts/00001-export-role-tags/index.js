const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const { stringify } = require('csv')
const find = require('lodash/find')

const { fetchRoleTagData } = require('../lib')

const toCsvData = promisify(stringify)
const writeFile = promisify(fs.writeFile)

async function action ({ db }) {
  const { roles, roleTags, tags } = await fetchRoleTagData(db)

  const columns = {
    _key: true,
    name: true
  }
  const data = roles.map(role => {
    const { _key, name } = role
    const result = { _key, name }
    roleTags.forEach(roleTag => {
      if (roleTag.role === _key) {
        const tag = find(tags, tag => tag._key === roleTag.tag).name
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
