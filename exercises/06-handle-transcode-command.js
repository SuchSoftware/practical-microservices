const uuid = require('uuid/v4')

const { config } = require('./preamble')
const TranscodeControls = require('../src/transcode-component/controls/commands/transcode')

const transcode = TranscodeControls.example()

// TODOs for this exercise:
// - The TODOs in src/transcode-component/index.js - Handle this command
// - The TODO in src/transcode-component/projection.js - Write the projection

config.transcodeComponent.handlers
  .Transcode(transcode)
  // Notice the double handling again
  .then(() => config.transcodeComponent.handlers.Transcode(transcode))
  .then(() => console.log('Transcoded.'))
  .finally(config.messageStore.stop)
