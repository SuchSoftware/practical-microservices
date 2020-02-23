const { join } = require('path')

const IdControls = require('../id')

module.exports = {
  example () {
    const transcribeId = IdControls.example()

    return {
      id: IdControls.example(),
      type: 'Transcribed',
      metadata: {},
      data: {
        transcribeId,
        uri: this.uri(),
        transcription: this.transcription()
      }
    }
  },

  transcription () {
    return "We're no strangers to love..."
  },

  uri () {
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
}
