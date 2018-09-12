const get = require('lodash/get')
const find = require('lodash/find')
const values = require('lodash/values')
const omit = require('lodash/omit')

const { logger } = require('@nudj/library')
const intercom = require('@nudj/library/lib/analytics/intercom')
const { values: hirerTypes } = require('../../schema/enums/hirer-types')

const hirerTypeTags = {
  [hirerTypes.ADMIN]: 'admin',
  [hirerTypes.MEMBER]: 'team-member'
}

const updateIntercomTagsForHirer = async (context, hirer) => {
  try {
    const person = await context.store.readOne({
      type: 'people',
      id: hirer.person
    })
    const intercomUser = await intercom.user.getOrCreate({
      email: person.email
    })

    const existingTags = get(intercomUser, 'tags.tags')
    const incorrectTag = values(omit(hirerTypeTags, [hirer.type]))[0]
    const hasCorrectTag = find(existingTags, {
      name: hirerTypeTags[hirer.type]
    })
    const hasIncorrectTag = find(existingTags, {
      name: incorrectTag
    })

    if (!hasCorrectTag) {
      await intercom.user.tag({
        user: intercomUser,
        tags: [
          hirerTypeTags[hirer.type]
        ]
      })
    }

    if (hasIncorrectTag) {
      await intercom.user.untag({
        user: intercomUser,
        tags: [incorrectTag]
      })
    }
  } catch (error) {
    logger('error', 'Error updating Intercom tags', error)
  }
}

module.exports = updateIntercomTagsForHirer
