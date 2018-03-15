const Prismic = require('prismic.io')
const union = require('lodash/union')

const accessToken = process.env.PRISMICIO_ACCESS_TOKEN

const fetchTags = async ({
  repo = 'hirer'
}) => {
  const url = `https://nudj-${repo}.prismic.io/api`
  const api = await Prismic.api(url, { accessToken })
  const query = await api.query()
  const tags = query.results.map(doc => doc.tags)

  return union(...tags)
}

module.exports = fetchTags
