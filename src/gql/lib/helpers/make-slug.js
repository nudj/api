const slug = require('slug')

const makeSlug = str => slug(str, {
  replacement: '-',
  symbols: true,
  lower: true
})

module.exports = makeSlug
