const startOfDay = timestamp => {
  if (!timestamp) return

  const validDate = (new Date(timestamp)).getTime() > 0
  if (!validDate) throw new Error('Invalid timestamp')
  return `${timestamp.split('T')[0]}T00:00:00.000Z`
}

const endOfDay = timestamp => {
  if (!timestamp) return

  const validDate = (new Date(timestamp)).getTime() > 0
  if (!validDate) throw new Error('Invalid timestamp')
  return `${timestamp.split('T')[0]}T23:59:59.999Z`
}

module.exports = {
  startOfDay,
  endOfDay
}
