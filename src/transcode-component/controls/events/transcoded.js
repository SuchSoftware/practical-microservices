const { join } = require('path')

const IdControls = require('../id')

module.exports = {
  example () {
    const videoId = IdControls.example()

    return {
      id: IdControls.example(),
      type: 'Transcoded',
      metadata: {},
      data: {
        videoId,
        uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    }
  }
}
