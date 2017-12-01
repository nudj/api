module.exports = (action) => {
  if (!action) {
    throw new Error('No action supplied')
  }
  const regex = new RegExp(/(create|update|delete|readOneOrCreate|updateOrCreate)\(\{\n(\s)+type: '(.*)'/, 'g')
  const matches = action.toString().match(regex) || []
  // remove cruft e.g. "create({\n type: 'createCollection'" => "createCollection"
  return matches.map(match => match.split("'")[1])
}
