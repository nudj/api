const possessiveCase = (name) => {
  if (name.endsWith('s')) return `${name}'`
  return `${name}'s`
}

module.exports = possessiveCase
