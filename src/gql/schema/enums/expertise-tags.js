const { rootEnum } = require('../../lib')

module.exports = rootEnum({
  name: 'ExpertiseTagType',
  // Values derived from Clearbit roles
  values: [
    'ceo',
    'communications',
    'consulting',
    'customerService',
    'education',
    'engineering',
    'finance',
    'founder',
    'healthProfessional',
    'humanResources',
    'informationTechnology',
    'legal',
    'marketing',
    'operations',
    'owner',
    'president',
    'product',
    'publicRelations',
    'realEstate',
    'recruiting',
    'research',
    'sales'
  ]
})
