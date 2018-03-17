const union = require('lodash/union')

const { logger } = require('@nudj/library')

const queryDocuments = require('./query-documents')
const fetchApiForRepo = require('./fetch-api-for-repo')

const fetchTags = async ({ repo, type }) => {
  try {
    const api = await fetchApiForRepo(repo)
    const documents = await queryDocuments({ api, type })
    const tags = documents.results.map(doc => doc.tags)

    return union(...tags)
  } catch (error) {
    logger('error', error)
    return null
  }
}

module.exports = fetchTags
