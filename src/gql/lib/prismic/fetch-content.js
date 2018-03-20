const mapValues = require('lodash/mapValues')

const { merge, logger } = require('@nudj/library')

const prismic = require('./prismic')
const queryDocuments = require('./query-documents')
const fragmentToText = require('./fragment-to-text')
const { values: prismicRepos } = require('../../schema/enums/prismic-repos')

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
  const api = await prismic(repo)

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
