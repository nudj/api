const mapValues = require('lodash/mapValues')
const { merge, logger } = require('@nudj/library')

const prismic = require('./prismic')
const queryDocuments = require('./query-documents')
const { values: prismicRepos } = require('../../schema/enums/prismic-repos')

const defaultKeys = {
  subject: 'composesubject',
  message: 'composetext'
}

const dataToJson = (data = {}) => {
  if (data.type && data.value) {
    // handle Prismic fragment data structures
    if (data.type === 'StructuredText') {
      // explicitly handle StructuredText so that it mirrors old fragmentToText
      return data.value.map(fragment => fragment.text || '').join('\n\n')
    } else {
      return dataToJson(data.value)
    }
  } else {
    // handle content data structures
    if (Array.isArray(data)) {
      return data.map(dataToJson)
    } else if (typeof data === 'object') {
      return mapValues(data, dataToJson)
    } else {
      return data
    }
  }
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
      const content = dataToJson(doc.rawJSON[type])
      return merge(
        mapValues(keys, key => content[key]),
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
