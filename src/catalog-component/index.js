const uuid = require('uuid/v4')

const projection = require('./projection')

// This component has 4 sets of handlers:
// 1. Its command stream
// 2. Its event stream
// 3. transcode's event stream
// 4. transcribe's event stream
function createCommandHandlers ({ messageStore }) {
  return {
    async Catalog (catalog) {
      // TODO
      // Handle the catalog command
      // We want to drive the process from events in `catalog` streams.
      // So, copy the command into a `Started` event in our entity stream.

      // 1. Fetch the video entity from the message store

      // 2. Make the handler idempotent by checking to see if the video has
      // already been started.

      // 3. If we haven't, then write a `Started` event

      return Promise.resolve(true)
    }
  }
}

function createComponent ({ messageStore }) {
  const commandHandlers = createCommandHandlers({ messageStore })

  const commandSubscription = messageStore.createSubscription({
    streamName: 'catalog:command',
    handlers: commandHandlers,
    subscriberId: 'catalogCommandConsumer'
  })

  function start () {
    console.log('Starting video catalog component')

    commandSubscription.start()
  }

  return {
    commandHandlers,
    start
  }
}

module.exports = createComponent
