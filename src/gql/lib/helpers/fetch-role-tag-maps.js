const fetchRoleToTagsMap = async (context) => {
  const [
    roleTags,
    roleRelatedTags
  ] = await Promise.all([
    await context.sql.readAll({
      type: 'roleTags'
    }),
    await context.sql.readAll({
      type: 'tags'
    })
  ])

  const rolesToRoleTagsMap = roleTags.reduce((map, roleTag) => {
    map[roleTag.role] = (map[roleTag.role] || []).concat(roleTag.tag)
    return map
  }, {})

  const roleTagsToTagsMap = roleRelatedTags.reduce((map, tag) => {
    map[tag.id] = map[tag.id] || tag
    return map
  }, {})

  return Object.keys(rolesToRoleTagsMap).reduce((map, roleId) => {
    map[roleId] = (rolesToRoleTagsMap[roleId] || []).map(tagId => roleTagsToTagsMap[tagId])
    return map
  }, {})
}

module.exports = fetchRoleToTagsMap
