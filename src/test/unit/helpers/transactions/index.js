const { generateId } = require('@nudj/library')

const setupDependencies = () => {
  global.loadArangoCryptoAdaptor = () => {}
  global.loadIdGenerator = () => generateId
}

const teardownDependencies = () => {
  delete global.loadArangoCryptoAdaptor
  delete global.loadIdGenerator
}

module.exports = {
  setupDependencies,
  teardownDependencies
}
