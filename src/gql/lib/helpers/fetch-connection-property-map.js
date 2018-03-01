const uniq = require('lodash/uniq')
const isNil = require('lodash/isNil')
const zipObject = require('lodash/zipObject')
const sortBy = require('lodash/sortBy')

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
    roleIds: sortBy(
      uniq(roleIds).filter(id => !isNil(id))
    ),
    companyIds: sortBy(
      uniq(companyIds).filter(id => !isNil(id))
    ),
    personIds: sortBy(
      uniq(personIds).filter(id => !isNil(id))
    ),
    sourceIds: sortBy(
      uniq(sourceIds).filter(id => !isNil(id))
    )
  }
}

const fetchPropertyValuesByIds = async (context, { roleIds, companyIds, personIds, sourceIds }) => {
  const [
    roles,
    companies,
    people,
    sources
  ] = await Promise.all([
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

  return {
    roles: sortBy(roles, 'id'),
    companies: sortBy(companies, 'id'),
    people: sortBy(people, 'id'),
    sources: sortBy(sources, 'id')
  }
}

const fetchConnectionPropertyMap = async (context, connections) => {
  const {
    roleIds,
    companyIds,
    personIds,
    sourceIds
  } = getPropertyIds(connections)

  const {
    roles,
    companies,
    people,
    sources
  } = await fetchPropertyValuesByIds(context, {
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