const { join } = require('path')

const IdControls = require('../id')

module.exports = {
  example () {
    return {
      id: IdControls.example(),
      type: 'Catalog',
      metadata: {},
      data: {
        videoId: IdControls.example(),
        uri: this.uri()
      }
    }
  },

  uri () {
    return 'https://www.youtube.com/watch?v=GI_P3UtZXAA'
  }
}
