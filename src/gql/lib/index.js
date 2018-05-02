const mergeDefinitions = require('./merge-definitions')
const handleErrors = require('./handle-errors')

const rootEnum = require('./root-enum')
const rootSingle = require('./root-single')
const rootSingleBySlug = require('./root-single-by-slug')
const rootSingleByFilters = require('./root-single-by-filters')
const rootAll = require('./root-all')
const rootAllByFilters = require('./root-all-by-filters')

const nestedSingle = require('./nested-single')
const nestedSingleForeign = require('./nested-single-foreign')
const nestedSingleByFilters = require('./nested-single-by-filters')
const nestedSingleByFiltersViaEdge = require('./nested-single-by-filters-via-edge')
const nestedSingleViaEdge = require('./nested-single-via-edge')
const nestedAllViaEdge = require('./nested-all-via-edge')
const nestedAll = require('./nested-all')
const nestedAllByFilters = require('./nested-all-by-filters')
const nestedAllByFiltersViaEdge = require('./nested-all-by-filters-via-edge')
const nestedCountByFilters = require('./nested-count-by-filters')

module.exports = {
  mergeDefinitions,
  handleErrors,

  rootEnum,
  rootAll,
  rootAllByFilters,
  rootSingle,
  rootSingleBySlug,
  rootSingleByFilters,

  nestedAll,
  nestedSingleByFilters,
  nestedSingleByFiltersViaEdge,
  nestedSingleViaEdge,
  nestedSingle,
  nestedSingleForeign,
  nestedAllViaEdge,
  nestedAllByFiltersViaEdge,
  nestedAllByFilters,
  nestedCountByFilters
}
