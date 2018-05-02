const startOfDay = timestamp => {
  if (!timestamp) return

  const validDate = (new Date(timestamp)).getTime() > 0
  if (!validDate) throw new Error('Invalid timestamp')
  return `${timestamp.split(' ')[0]} 00:00:00`
}

const endOfDay = timestamp => {
  if (!timestamp) return

  const validDate = (new Date(timestamp)).getTime() > 0
  if (!validDate) throw new Error('Invalid timestamp')
  return `${timestamp.split(' ')[0]} 23:59:59`
}

module.exports = {
  startOfDay,
  endOfDay
}
