const mergeDefinitions = require('./merge-definitions')
const handleErrors = require('./handle-errors')

const rootEnum = require('./root-enum')
const rootSingle = require('./root-single')
const rootSingleByFilters = require('./root-single-by-filters')
const rootAll = require('./root-all')
const rootAllByFilters = require('./root-all-by-filters')

const nestedSingle = require('./nested-single')
const nestedSingleForeign = require('./nested-single-foreign')
const nestedSingleByFilters = require('./nested-single-by-filters')
const nestedAll = require('./nested-all')
const nestedAllByFilters = require('./nested-all-by-filters')
const nestedCountByFilters = require('./nested-count-by-filters')

module.exports = {
  mergeDefinitions,
  handleErrors,

  rootEnum,
  rootAllByFilters,
  rootAll,
  rootSingleByFilters,
  rootSingle,

  nestedAllByFilters,
  nestedAll,
  nestedSingleByFilters,
  nestedSingle,
  nestedSingleForeign,
  nestedCountByFilters
}
