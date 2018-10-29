const get = require('lodash/get')
const find = require('lodash/find')
const values = require('lodash/values')

const { logger } = require('@nudj/library')
const intercom = require('@nudj/library/lib/analytics/intercom')
const { values: hirerTypes } = require('../../schema/enums/hirer-types')

const intercomTags = {
  [hirerTypes.ADMIN]: 'admin',
  [hirerTypes.MEMBER]: 'team-member'
}

const updateIntercomTagsForHirer = async (context, hirer) => {
  try {
    const person = await context.sql.readOne({
      type: 'people',
      id: hirer.person
    })
    const intercomUser = await intercom.user.getOrCreate({
      email: person.email
    })

    const existingTags = get(intercomUser, 'tags.tags')
    const hasCorrectTag = find(existingTags, {
      name: intercomTags[hirer.type]
    })

    if (!hasCorrectTag) {
      await intercom.user.untag({
        user: intercomUser,
        tags: values(intercomTags)
      })

      await intercom.user.tag({
        user: intercomUser,
        tags: [
          intercomTags[hirer.type]
        ]
      })
    }
  } catch (error) {
    logger('error', 'Error updating Intercom tags', error)
  }
}

module.exports = updateIntercomTagsForHirer
