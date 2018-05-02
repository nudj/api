const generateSlug = require('slug')
const hash = require('hash-generator')

const makeSlug = (str, addHash) => {
  const slug = generateSlug(str, {
    replacement: '-',
    symbols: true,
    lower: true
  })
  return addHash ? `${slug}-${hash(8)}` : slug
}

module.exports = makeSlug
