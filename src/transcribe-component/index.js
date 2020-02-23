const uuid = require('uuid/v4')

// Function for faking the transcription
function transcribeVideo (uri) {
  return `
    We're no strangers to love
    You know the rules and so do I...
  `
}

// Handlers will do the actual work of handling messages.
// They are analogous to HTTP handlers, only the stimulus they respond to is
// one of the messages communicated over pub/sub.
//
// Fleshing out these handlers is the main activity of the workshop.
function createHandlers ({ messageStore }) {
  return {
    async Transcribe (transcribe) {
      const { transcribeId, uri } = transcribe.data
      const transcription = transcribeVideo(uri)

      const transcribed = {
        id: uuid(),
        type: 'Transcribed',
        metadata: {
          traceId: transcribe.metadata.traceId,
          originStreamName: transcribe.metadata.originStreamName
        },
        data: {
          transcribeId,
          uri,
          transcription
        }
      }
      const streamName = `transcribe-${transcribeId}`

      return messageStore.write(streamName, transcribed)
    }
  }
}

// This top-level function will receive dependencies in future steps
function build ({ messageStore }) {
  const handlers = createHandlers({ messageStore })
  // Components get new messages to process by polling the message store.
  // We decouple actually starting the component from the rest of its
  // definition.  Naturally, starting the polling cycle in test would proveo
  // problematic.
  //
  // The convention in this code base is that each component exposes a `start`
  // function that gets picked up in `src/index.js`.
  function start () {
    console.log('Starting transcribe component')
  }

  return {
    handlers,
    start
  }
}

module.exports = build
