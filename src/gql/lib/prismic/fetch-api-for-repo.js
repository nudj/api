const Prismic = require('prismic.io')
const { values: prismicRepos } = require('../../schema/enums/prismic-repos')

const fetchRepoCredentials = (repo) => {
  switch (repo) {
    case prismicRepos.WEB:
      return Prismic.api(`https://nudj-${prismicRepos.WEB}.prismic.io/api`, {
        accessToken: process.env.PRISMICIO_WEB_ACCESS_TOKEN
      })
    case prismicRepos.HIRE:
      return Prismic.api(`https://nudj-${prismicRepos.HIRE}.prismic.io/api`, {
        accessToken: process.env.PRISMICIO_ACCESS_TOKEN
      })
    default:
      throw new Error(`Unrecognised repo: ${repo}`)
  }
}

module.exports = fetchRepoCredentials
