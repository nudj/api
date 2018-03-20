const union = require('lodash/union')

const { logger } = require('@nudj/library')

const prismic = require('./prismic')
const queryDocuments = require('./query-documents')

const fetchTags = async ({ repo, type }) => {
  try {
    const api = await prismic(repo)
    const documents = await queryDocuments({ api, type })
    const tags = documents.results.map(doc => doc.tags)

    return union(...tags)
  } catch (error) {
    logger('error', error)
    return null
  }
}

module.exports = fetchTags
