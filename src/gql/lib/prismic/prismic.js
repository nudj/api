const Prismic = require('prismic.io')
const { values: prismicRepos } = require('../../schema/enums/prismic-repos')

const apiMap = {}

const prismic = (repo) => {
  if (apiMap[repo]) return apiMap[repo]

  switch (repo) {
    case prismicRepos.WEB:
      apiMap[repo] = Prismic.api(`https://nudj-${prismicRepos.WEB}.prismic.io/api`, {
        accessToken: process.env.PRISMICIO_WEB_ACCESS_TOKEN
      })
      break
    case prismicRepos.HIRE:
      apiMap[repo] = Prismic.api(`https://nudj-${prismicRepos.HIRE}.prismic.io/api`, {
        accessToken: process.env.PRISMICIO_ACCESS_TOKEN
      })
      break
    default:
      throw new Error(`Unrecognised repo: ${repo}`)
  }
  return apiMap[repo]
}

module.exports = prismic
