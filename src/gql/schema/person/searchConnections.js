const get = require('lodash/get')
const deburr = require('lodash/deburr')
const unionBy = require('lodash/unionBy')
const union = require('lodash/union')
const values = require('lodash/values')
const fetchConnectionPropertyMap = require('../../lib/helpers/fetch-connection-property-map')
const { values: tagTypes } = require('../enums/tag-types')

const searchKeys = [
  {
    name: 'fullName',
    weight: 1
  },
  {
    name: 'firstName',
    weight: 0.85
  },
  {
    name: 'lastName',
    weight: 0.75
  },
  {
    name: 'person.email',
    weight: 0.25
  },
  {
    name: 'role.name',
    weight: 0.25
  },
  {
    name: 'company.name',
    weight: 0.125
  }
]
const accuracyWeights = {
  exact: 3,
  prefix: 2,
  fuzzy: 1
}

function normaliseString (str) {
  return stripEmoji(deburr(str.toLowerCase()))
}

function match (connection, term) {
  const terms = term.split(' ')
  let matches = []
  let score = 0

  for (let n = 0; n < terms.length; n++) {
    for (let i = 0; i < searchKeys.length; i++) {
      const property = get(connection, searchKeys[i].name, '')
      const normalisedProperty = normaliseString(property)
      let accuracyWeight

      switch (true) {
        // exact
        case normalisedProperty === terms[n]:
          accuracyWeight = accuracyWeights.exact
          break
        // prefix
        case normalisedProperty.startsWith(terms[n]):
          accuracyWeight = accuracyWeights.prefix
          break
        // fuzzy
        case normalisedProperty.includes(terms[n]):
          accuracyWeight = accuracyWeights.fuzzy
          break
      }
      if (accuracyWeight) {
        matches.push(property)
        score += searchKeys[i].weight * accuracyWeight
      }
    }
  }

  return {
    matches,
    score
  }
}

function stripEmoji (str) {
  let output = ''
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) <= 127) {
      output += str.charAt(i)
    }
  }
  return output.trim()
}

module.exports = {
  typeDefs: `
    extend type Person {
      searchConnections(
        query: String!
        filters: ConnectionSearchFilters
      ): ConnectionSearchResults
    }

    input ConnectionSearchFilters {
      expertiseTags: [ID!]
      favourites: Boolean
    }

    type ConnectionSearchResults {
      connections: [Connection!]!
      tags: [Tag!]!
    }
  `,
  resolvers: {
    Person: {
      searchConnections: async (person, args, context) => {
        const {
          query,
          filters = {}
        } = args

        const isFilteredByFavourites = filters.favourites
        const isFilteredByExpertise = filters.expertiseTags && !!filters.expertiseTags.length

        // build map of...
        // - connection to tags
        // - tag to connections (when filtering by expertise)
        const surveyAnswers = await context.store.readAll({
          type: 'surveyAnswers',
          filters: { person: person.id }
        })
        const connectionTagMap = {}
        const tagConnectionMap = {}
        await Promise.all(surveyAnswers.map(async answer => {
          const entityTags = await context.store.readAll({
            type: 'entityTags',
            filters: {
              entityType: 'surveyQuestion',
              entityId: answer.surveyQuestion
            }
          })
          let tags = await context.store.readMany({
            type: 'tags',
            ids: entityTags.map(entityTag => entityTag.tagId)
          })
          tags = tags.filter(tag => tag.type === tagTypes.EXPERTISE)

          answer.connections.forEach(connectionId => {
            const connectionTags = connectionTagMap[connectionId] || []
            connectionTagMap[connectionId] = unionBy(connectionTags, tags, 'id')
          })
          if (isFilteredByExpertise) {
            tags.forEach(tag => {
              const tagConnections = tagConnectionMap[tag.id] || []
              tagConnectionMap[tag.id] = union(tagConnections, answer.connections)
            })
          }
        }))

        // fetch connections
        let connections
        if (isFilteredByFavourites) {
          connections = await context.store.readMany({
            type: 'connections',
            ids: Object.keys(connectionTagMap)
          })
        } else {
          connections = await context.store.readAll({
            type: 'connections',
            filters: { from: person.id }
          })
        }

        // Fetch tags for each connection's role
        connections.forEach(async connection => {
          const roleTags = await context.store.readAll({
            type: 'roleTags',
            filters: {
              entityId: connection.role
            }
          })

          const tags = await context.store.readMany({
            type: 'tags',
            ids: roleTags.map(roleTag => roleTag.tagId)
          })

          if (connectionTagMap[connection.id]) {
            const connectionTags = connectionTagMap[connection.id] || []
            connectionTagMap[connection.id] = unionBy(connectionTags, tags, 'id')
          } else {
            connectionTagMap[connection.id] = tags || []
          }
        })

        // fetch nested entities for connections and collate tags
        const {
          roleMap,
          companyMap,
          personMap
        } = await fetchConnectionPropertyMap(context, connections)

        connections = connections.map(connection => ({
          ...connection,
          role: roleMap[connection.role],
          company: companyMap[connection.company],
          person: personMap[connection.person],
          tags: connectionTagMap[connection.id] || []
        }))

        // apply search filter
        const normalisedTerm = normaliseString(query)
        const hasQuery = normalisedTerm.length
        const tagsMap = {}
        connections = connections.reduce((matched, connection) => {
          let ignore
          if (hasQuery) {
            const { score, matches } = match(connection, normalisedTerm)
            if (score > 0) {
              connection = {
                ...connection,
                _result: { score, matches }
              }
            } else {
              ignore = true
            }
          }
          if (!ignore) {
            if (isFilteredByExpertise) {
              ignore = true
            }
            connection.tags.forEach(tag => {
              tagsMap[tag.id] = tag
              if (isFilteredByExpertise && filters.expertiseTags.includes(tag.id)) {
                ignore = false
              }
            })
          }
          if (!ignore) {
            matched.push(connection)
          }
          return matched
        }, [])
        const tags = values(tagsMap)

        // sort connections by score
        connections = connections.sort((a, b) => get(b, '_result.score') - get(a, '_result.score'))

        return {
          connections,
          tags
        }
      }
    }
  }
}
