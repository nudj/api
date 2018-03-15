const Prismic = require('prismic.io')

const predicatesOperator = (key) => {
  if (key === 'document.tags') return Prismic.Predicates.any
  return Prismic.Predicates.at
}

const queryDocuments = ({ api, query }) => {
  const prismicQuery = Object.keys(query).map(key => {
    return predicatesOperator(key)(key, query[key])
  })
  return api.query(prismicQuery) // calling api.query('') returns all documents
}

module.exports = queryDocuments
