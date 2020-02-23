const { join } = require('path')

const IdControls = require('../id')

module.exports = {
  example () {
    return {
      id: IdControls.example(),
      type: 'Transcode',
      metadata: {
        originStreamName: `catalog-${IdControls.example()}`
      },
      data: {
        transcodeId: IdControls.example(),
        source: this.source()
      }
    }
  },

  source () {
    return 'https://www.youtube.com/watch?v=GI_P3UtZXAA'
  },

  destination () {
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
}
