const Prismic = require('prismic.io')
const omitBy = require('lodash/omitBy')
const isUndefined = require('lodash/isUndefined')

const predicatesOperator = (key) => {
  if (key === 'document.tags') return Prismic.Predicates.any
  return Prismic.Predicates.at
}

const queryDocuments = ({ api, type, tags }) => {
  const query = omitBy({
    'document.type': type,
    'document.tags': tags
  }, isUndefined)
  const prismicQuery = Object.keys(query).map(key => {
    return predicatesOperator(key)(key, query[key])
  })

  return api.query(prismicQuery) // calling api.query('') returns all documents
}

module.exports = queryDocuments
