const find = require('lodash/find')
const hash = require('hash-generator')

const makeSlug = require('./make-slug')

const getHashedSlug = slug => `${slug}-${hash(8)}`

const getMakeUniqueCompanySlug = companies => {
  let cache = {...companies}

  return company => {
    const slug = makeSlug(company.name)
    let uniqueSlug = slug

    if (cache[company.id] && cache[company.id].slug) {
      return cache[company.id].slug
    }

    while (find(cache, { slug: uniqueSlug })) {
      uniqueSlug = getHashedSlug(slug)
    }

    cache = {
      ...cache,
      [company.id]: {
        ...company,
        slug: uniqueSlug
      }
    }

    return uniqueSlug
  }
}

module.exports = getMakeUniqueCompanySlug
