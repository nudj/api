const Prismic = require('prismic.io')
const mapValues = require('lodash/mapValues')
const { merge, logger } = require('@nudj/library')

const accessToken = process.env.PRISMICIO_ACCESS_TOKEN
const defaultKeys = {
  subject: 'composesubject',
  message: 'composetext'
}

async function fetchContent ({
  type,
  repo = 'hirer',
  tags = ['default'],
  keys = defaultKeys
}) {
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

function fragmentToText (fragment) {
  if (!fragment) return ''
  if (fragment.value && !fragment.blocks) return fragment.value.toString()
  if (!fragment.blocks) return ''

  const text = fragment.blocks.map(block => block.text || '')
  return text.join('\n\n')
}

function predicatesOperator (key) {
  switch (key) {
    case 'document.tags':
      return Prismic.Predicates.any
    default:
      return Prismic.Predicates.at
  }
}

function queryDocuments ({ api, query }) {
  const prismicQuery = Object.keys(query).map(key => {
    return predicatesOperator(key)(key, query[key])
  })
  return api.query(prismicQuery) // calling api.query('') returns all documents
}

module.exports = fetchContent
