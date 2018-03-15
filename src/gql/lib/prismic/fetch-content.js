const Prismic = require('prismic.io')
const mapValues = require('lodash/mapValues')

const { merge, logger } = require('@nudj/library')

const queryDocuments = require('./query-documents')
const fragmentToText = require('./fragment-to-text')

const accessToken = process.env.PRISMICIO_ACCESS_TOKEN

const defaultKeys = {
  subject: 'composesubject',
  message: 'composetext'
}

const fetchContent = async ({
  type,
  repo = 'hirer',
  tags = ['default'],
  keys = defaultKeys
}) => {
  const query = {
    'document.type': type,
    'document.tags': tags
  }
  const url = `https://nudj-${repo}.prismic.io/api`

  try {
    const api = await Prismic.api(url, { accessToken })
    const response = await queryDocuments({ api, query })

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
