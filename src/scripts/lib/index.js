const { fetchAll } = require('../../lib')

async function fetchRoleTagData (db) {
  const [ roles, roleTags, tags ] = await Promise.all([
    await fetchAll(db, 'roles'),
    await fetchAll(db, 'roleTags'),
    await fetchAll(db, 'tags')
  ])
  return { roles, roleTags, tags }
}

module.exports = {
  fetchRoleTagData
}
