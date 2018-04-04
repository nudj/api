const loadArangoCryptoAdaptor = (arangoCryptoAlgorithm) => ({
  randomBytes: (length) => ({
    toString: () => arangoCryptoAlgorithm.genRandomAlphaNumbers(length)
  }),
  createHash: (hashType) => ({
    update: (input) => ({
      digest: () => arangoCryptoAlgorithm[hashType](input)
    })
  })
})

module.exports = loadArangoCryptoAdaptor
