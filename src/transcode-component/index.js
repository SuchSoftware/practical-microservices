const uuid = require('uuid/v4')

const projection = require('./projection')

// Returns a url to the transcoded file
function transcodeFile (source) {
  // More simulation shenanigans
  console.log('If real transcoding were going on, you bet it would be here')

  return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
}

// Fleshing out these handlers is the main activity of the workshop.
function createHandlers ({ messageStore }) {
  return {
    async Transcode (transcode) {
      const transcodeId = transcode.data.transcodeId
      const streamName = `transcode-${transcodeId}`
      const transcoding = await messageStore.fetch(streamName, projection)

      if (transcoding.isTranscoded) {
        console.log(`(${transcodeId}): Already transcoded. Skipping.`)

        return true
      }

      const transcodedUri = transcodeFile(transcode.data.uri)

      const transcoded = {
        id: uuid(),
        type: 'Transcoded',
        metadata: {
          traceId: transcode.metadata.traceId,
          originStreamName: transcode.metadata.originStreamName
        },
        data: {
          transcodeId,
          uri: transcode.data.uri,
          transcodedUri
        }
      }

      return messageStore.write(streamName, transcoded)
    }
  }
}

function createComponent ({ messageStore }) {
  const handlers = createHandlers({ messageStore })

  const commandSubscription = messageStore.createSubscription({
    streamName: 'transcode:command',
    handlers,
    subscriberId: 'transcodeCommandConsumer'
  })

  function start () {
    console.log('Starting transcode component')

    commandSubscription.start()
  }

  return {
    handlers,
    start
  }
}

module.exports = createComponent
