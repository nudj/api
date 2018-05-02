const get = require('lodash/get')
const deburr = require('lodash/deburr')
const unionBy = require('lodash/unionBy')
const union = require('lodash/union')
const values = require('lodash/values')
const fetchConnectionPropertyMap = require('../../lib/helpers/fetch-connection-property-map')
const fetchRoleToTagsMap = require('../../lib/helpers/fetch-role-tag-maps')
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
        const surveyAnswers = await context.sql.readAll({
          type: 'surveyAnswers',
          filters: { person: person.id }
        })
        const connectionTagMap = {}
        const tagConnectionMap = {}
        await Promise.all(surveyAnswers.map(async surveyAnswer => {
          const surveyQuestionTags = await context.sql.readAll({
            type: 'surveyQuestionTags',
            filters: { surveyQuestion: surveyAnswer.surveyQuestion }
          })
          let tags = await context.sql.readMany({
            type: 'tags',
            ids: surveyQuestionTags.map(surveyQuestionTag => surveyQuestionTag.tag)
          })
          tags = tags.filter(tag => tag.type === tagTypes.EXPERTISE)
          const surveyAnswerConnections = await context.sql.readAll({
            type: 'surveyAnswerConnections',
            filters: {
              surveyAnswer: surveyAnswer.id
            }
          })
          surveyAnswerConnections.forEach(surveyAnswerConnection => {
            const connectionId = surveyAnswerConnection.connection
            const connectionTags = connectionTagMap[connectionId] || []
            connectionTagMap[connectionId] = unionBy(connectionTags, tags, 'id')
          })
          if (isFilteredByExpertise) {
            tags.forEach(tag => {
              const tagConnections = tagConnectionMap[tag.id] || []
              tagConnectionMap[tag.id] = union(tagConnections, surveyAnswerConnections.map(item => item.connection))
            })
          }
        }))

        // fetch connections
        let connections
        if (isFilteredByFavourites) {
          connections = await context.sql.readMany({
            type: 'connections',
            ids: Object.keys(connectionTagMap)
          })
        } else {
          connections = await context.sql.readAll({
            type: 'connections',
            filters: { from: person.id }
          })
        }

        // fetch nested entities for connections and collate tags
        const rolesToTagsMap = await fetchRoleToTagsMap(context)
        const {
          roleMap,
          companyMap,
          personMap
        } = await fetchConnectionPropertyMap(context, connections)

        connections = connections.map(connection => {
          const savedTags = (connection.tags || []).concat(connectionTagMap[connection.id] || [])
          const roleTags = rolesToTagsMap[connection.role]

          return {
            ...connection,
            role: roleMap[connection.role],
            company: companyMap[connection.company],
            person: personMap[connection.person],
            tags: unionBy(savedTags, roleTags, 'id')
          }
        })

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
              if (isFilteredByExpertise && filters.expertiseTags.includes(`${tag.id}`)) {
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
