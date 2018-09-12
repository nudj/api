const get = require('lodash/get')
const find = require('lodash/find')
const values = require('lodash/values')
const omit = require('lodash/omit')

const { logger } = require('@nudj/library')
const { intercom } = require('@nudj/library/analytics')
const { values: hirerTypes } = require('../../schema/enums/hirer-types')

const intercomTags = {
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
    const incorrectTag = values(omit(intercomTags, [hirer.type]))[0]
    const hasCorrectTag = find(existingTags, {
      name: intercomTags[hirer.type]
    })
    const hasIncorrectTag = find(existingTags, {
      name: incorrectTag
    })

    if (!hasCorrectTag && !hasIncorrectTag) {
      // has no tags
      await intercom.user.tag({
        user: intercomUser,
        tags: [
          intercomTags[hirer.type]
        ]
      })
    } else if ((!hasCorrectTag && hasIncorrectTag) || (hasCorrectTag && hasIncorrectTag)) {
      // has only incorrect tag OR has both tags
      await intercom.user.untag({
        user: intercomUser,
        tags: [incorrectTag]
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
