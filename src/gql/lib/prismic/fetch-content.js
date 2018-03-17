const mapValues = require('lodash/mapValues')

const { merge, logger } = require('@nudj/library')

const { values: prismicRepos } = require('../../schema/enums/prismic-repos')
const queryDocuments = require('./query-documents')
const fragmentToText = require('./fragment-to-text')
const fetchApiForRepo = require('./fetch-api-for-repo')

const defaultKeys = {
  subject: 'composesubject',
  message: 'composetext'
}

const fetchContent = async ({
  type,
  repo = prismicRepos.HIRE,
  tags = ['default'],
  keys = defaultKeys
}) => {
  const api = await fetchApiForRepo(repo)

  try {
    const response = await queryDocuments({ api, type, tags })

    return response.results.map(doc => {
      return merge(
        mapValues(keys, value => fragmentToText(doc.get(`${type}.${value}`))),
        {
          tags: doc.tags
        }
      )
    })
  } catch (error) {
    logger('error', error)
    return null
  }
}

module.exports = fetchContent
