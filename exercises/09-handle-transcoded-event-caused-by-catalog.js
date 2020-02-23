const uuid = require('uuid/v4')

const { config } = require('./preamble')
const TranscodedControls = require('../src/transcode-component/controls/events/transcoded')

const transcoded = TranscodedControls.example()
transcoded.metadata.traceId = uuid()
transcoded.metadata.originStreamName = `catalog-${uuid()}`

config.catalogComponent.transcodeEventHandlers
  .Transcoded(transcoded)
  .then(() =>
    config.catalogComponent.transcodeEventHandlers.Transcoded(transcoded)
  )
  .then(() => console.log('Transcoded processed.'))
  .catch(err => console.log(err))
  .finally(config.messageStore.stop)
