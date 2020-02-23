const { join } = require('path')

const IdControls = require('../id')

module.exports = {
  example () {
    return {
      id: IdControls.example(),
      type: 'Transcribed',
      metadata: {},
      data: {
        videoId: IdControls.example(),
        transcribeId: IdControls.example(),
        uri: this.uri(),
        transcription: this.transcription()
      }
    }
  },

  uri () {
    return 'https://www.youtube.com/watch?v=GI_P3UtZXAA'
  },

  transcription () {
    return `
      We're no strangers to love
      You know the rules and so do I...
    `
  }
}
