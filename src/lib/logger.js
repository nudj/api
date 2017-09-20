module.exports = (type, ...args) => console[type === 'info' ? 'log' : type](...args)
