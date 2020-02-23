const { join } = require('path')

const IdControls = require('../id')

module.exports = {
  example () {
    const transcodeId = IdControls.example()

    return {
      id: IdControls.example(),
      type: 'Transcoded',
      metadata: {},
      data: {
        transcodeId,
        uri: this.uri(),
        transcodedUri: this.transcodedUri()
      }
    }
  },

  uri () {
    return 'https://www.youtube.com/watch?v=GI_P3UtZXAA'
  },

  transcodedUri () {
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
}
