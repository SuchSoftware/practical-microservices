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
      // TODO 1. Where do you get the id?
      const transcodeId = ''
      // TODO 2. What is the stream name where the events for this transcoding
      // live?
      const streamName = ''
      // TODO 3. Which message store function do you use to, um, "fetch" an
      // entity from the Message Store?
      // TODO 4. Don't forget to fill out the projection in ./projection.js
      const transcoding = await messageStore.WHAT_FUNCTION(
        streamName,
        projection
      )

      // TODO 5. Make it idempotent
      if (false) {
        console.log(`(${transcodeId}): Already transcoded. Skipping.`)

        return true
      }

      // 6. Do the actual work.  This one is done for you.
      const transcodedUri = transcodeFile(transcode.data.uri)

      const transcoded = {
        id: uuid(),
        type: 'Transcoded',
        metadata: {
          traceId: transcode.metadata.traceId,
          originStreamName: transcode.metadata.originStreamName
        },
        data: {
          videoId: transcode.data.videoId,
          uri: transcode.data.uri,
          transcodedUri,
          processedTime: new Date().toISOString()
        }
      }

      // TODO: 7. Instead of just returning true, write `transcoded` to the
      // Message Store, returning the resulting Promise.  Use the
      // `streamName` you constructed above.
      return true
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
