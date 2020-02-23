const Raw = {
  example () {
    return new Date('27 July 1987')
  }
}

module.exports = {
  example () {
    return Raw.example().toISOString()
  },

  Raw,

  Processed: {
    example () {
      return this.raw().toISOString()
    },

    raw () {
      const base = Raw.example().getTime()
      const processed = base + this.offsetMilliseconds()

      return new Date(processed)
    },

    offsetMilliseconds () {
      return 11
    }
  }
}
