const slug = require('slug')

const makeSlug = str => {
  if (!str) return ''

  return slug(str, {
    replacement: '-',
    symbols: true,
    lower: true
  })
}

module.exports = makeSlug
