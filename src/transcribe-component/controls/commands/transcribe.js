const { join } = require('path')

const IdControls = require('../id')

module.exports = {
  example () {
    const transcribeId = IdControls.example()

    return {
      id: IdControls.example(),
      type: 'Transcribe',
      metadata: {},
      data: {
        transcribeId,
        uri: this.uri()
      }
    }
  },

  uri () {
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
}
