const uuid = require('uuid/v4')

const { config } = require('./preamble')
const TranscodeControls = require('../src/transcode-component/controls/commands/transcode')

const transcode = TranscodeControls.example()

config.transcodeComponent.handlers
  .Transcode(transcode)
  // Notice the double handling again
  .then(() => config.transcodeComponent.handlers.Transcode(transcode))
  .then(() => console.log('Transcoded.'))
  .finally(config.messageStore.stop)
