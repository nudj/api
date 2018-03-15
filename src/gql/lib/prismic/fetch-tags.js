const Prismic = require('prismic.io')
const union = require('lodash/union')

const accessToken = process.env.PRISMICIO_WEB_ACCESS_TOKEN

const fetchTags = async () => {
  const api = await Prismic.api(
    `https://nudj-web.prismic.io/api`,
    {
      accessToken
    }
  )
  const query = await api.query()
  const tags = query.results.map(doc => doc.tags)

  return union(...tags)
}

module.exports = fetchTags
