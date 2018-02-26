const uniq = require('lodash/uniq')
const isNil = require('lodash/isNil')
const zipObject = require('lodash/zipObject')

const getPropertyIds = connections => {
  const {
    roleIds,
    companyIds,
    personIds,
    sourceIds
  } = connections.reduce((idMap, connection) => ({
    roleIds: idMap.roleIds.concat(connection.role),
    companyIds: idMap.companyIds.concat(connection.company),
    personIds: idMap.personIds.concat(connection.person),
    sourceIds: idMap.sourceIds.concat(connection.source)
  }), {
    roleIds: [],
    companyIds: [],
    personIds: [],
    sourceIds: []
  })

  return {
    roleIds: uniq(roleIds).filter(id => !isNil(id)),
    companyIds: uniq(companyIds).filter(id => !isNil(id)),
    personIds: uniq(personIds).filter(id => !isNil(id)),
    sourceIds: uniq(sourceIds).filter(id => !isNil(id))
  }
}

const fetchPropertyValuesByIds = (context, { roleIds, companyIds, personIds, sourceIds }) => {
  return Promise.all([
    context.store.readMany({
      type: 'roles',
      ids: roleIds
    }),
    context.store.readMany({
      type: 'companies',
      ids: companyIds
    }),
    context.store.readMany({
      type: 'people',
      ids: personIds
    }),
    context.store.readMany({
      type: 'sources',
      ids: sourceIds
    })
  ])
}

const fetchConnectionPropertyMap = async (context, connections) => {
  const {
    roleIds,
    companyIds,
    personIds,
    sourceIds
  } = getPropertyIds(connections)

  const [
    roles,
    companies,
    people,
    sources
  ] = await fetchPropertyValuesByIds(context, {
    roleIds,
    companyIds,
    personIds,
    sourceIds
  })

  return {
    roleMap: zipObject(roleIds, roles),
    companyMap: zipObject(companyIds, companies),
    personMap: zipObject(personIds, people),
    sourceMap: zipObject(sourceIds, sources)
  }
}

module.exports = fetchConnectionPropertyMap
