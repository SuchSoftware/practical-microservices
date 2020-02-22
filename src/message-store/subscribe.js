// START: shell
const Bluebird = require('bluebird')
const uuid = require('uuid/v4')

// START: filterOnOriginMatch
const category = require('./category')
// END: filterOnOriginMatch

// START: filterOnOriginMatch
// START: innerShell
function configureCreateSubscription ({ read, readLastMessage, write }) {
  // END: shell
  // END: innerShell
  // ...
  // END: filterOnOriginMatch
  // START: innerShell
  return ({
    // <callout id="co.constructSubscription" />
    streamName,
    handlers,
    messagesPerTick = 100,
    subscriberId,
    positionUpdateInterval = 100,
    // END: innerShell
    // START_HIGHLIGHT
    originStreamName = null,
    // END_HIGHLIGHT
    // START: innerShell
    tickIntervalMs = 100
  }) => {
    const subscriberStreamName = `subscriberPosition-${subscriberId}` // <callout id="co.subscription.setup" />

    let currentPosition = 0
    let messagesSinceLastPositionWrite = 0
    let keepGoing = true
    // END: innerShell

    /**
     * @description - Writes the subscription's read position
     */
    // START: messageStore.subscribe.writePosition
    function writePosition (position) {
      const positionEvent = {
        id: uuid(),
        type: 'Read',
        data: { position }
      }

      return write(subscriberStreamName, positionEvent)
    }
    // END: messageStore.subscribe.writePosition

    // START: messageStore.subscribe.updateReadPosition
    function updateReadPosition (position) {
      currentPosition = position
      messagesSinceLastPositionWrite += 1

      if (messagesSinceLastPositionWrite === positionUpdateInterval) {
        messagesSinceLastPositionWrite = 0

        return writePosition(position)
      }

      return Bluebird.resolve(true)
    }
    // END: messageStore.subscribe.updateReadPosition

    // START: messageStore.subscribe.loadPosition
    function loadPosition () {
      return readLastMessage(subscriberStreamName).then(message => {
        currentPosition = message ? message.data.position : 0
      })
    }
    // END: messageStore.subscribe.loadPosition

    // START: filterOnOriginMatch
    function filterOnOriginMatch (messages) {
      // <label id="code.messageStore.filterOnOriginMatch" />
      if (!originStreamName) {
        // <label id="code.messageStore.filterOnOriginMatch.bail" />
        return messages
      }

      return messages.filter(message => {
        const originCategory = // <label id="code.messageStore.filterOnOriginMatch.originCategory" />
          message.metadata && category(message.metadata.originStreamName)

        return originStreamName === originCategory // <label id="code.messasgeStore.filterOnOriginMatch.return" />
      })
    }
    // END: filterOnOriginMatch

    // START: getNextBatchOfMessages.with.origin
    // START: messageStore.subscribe.getNextBatchOfMessages
    function getNextBatchOfMessages () {
      return (
        read(streamName, currentPosition + 1, messagesPerTick)
          // END: messageStore.subscribe.getNextBatchOfMessages
          // START_HIGHLIGHT
          .then(filterOnOriginMatch)
      )
      // END_HIGHLIGHT
      // START: messageStore.subscribe.getNextBatchOfMessages
    }
    // END: messageStore.subscribe.getNextBatchOfMessages
    // END: getNextBatchOfMessages.with.origin

    // START: messageStore.subscribe.handleMessage
    function handleMessage (message) {
      const handler = handlers[message.type] || handlers.$any

      return handler ? handler(message) : Promise.resolve(true)
    }
    // END: messageStore.subscribe.handleMessage

    // START: messageStore.subscribe.processBatch
    function processBatch (messages) {
      return Bluebird.each(messages, message =>
        handleMessage(message)
          .then(() => updateReadPosition(message.globalPosition))
          .catch(err => {
            logError(message, err)

            // Re-throw so that we can break the chain
            throw err
          })
      ).then(() => messages.length)
    }
    // END: messageStore.subscribe.processBatch

    function logError (lastMessage, error) {
      // eslint-disable-next-line no-console
      console.error(
        'error processing:\n',
        `\t${subscriberId}\n`,
        `\t${lastMessage.id}\n`,
        `\t${error}\n`
      )
    }

    /**
     * @description - Generally not called from the outside.  This function is
     *   called on each of the timeouts to see if there are new events that need
     *   processing.
     */
    // START: messageStore.subscribe.tick
    function tick () {
      return getNextBatchOfMessages()
        .then(processBatch)
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error('Error processing batch', err)

          stop()
        })
    }
    // END: messageStore.subscribe.tick

    // START: messageStore.subscribe.poll
    async function poll () {
      await loadPosition()

      // eslint-disable-next-line no-unmodified-loop-condition
      while (keepGoing) {
        const messagesProcessed = await tick()

        if (messagesProcessed === 0) {
          await Bluebird.delay(tickIntervalMs)
        }
      }
    }
    // END: messageStore.subscribe.poll

    // START: messageStore.subscribe.start
    function start () {
      // eslint-disable-next-line
      console.log(`Started ${subscriberId}`)

      return poll()
    }
    // END: messageStore.subscribe.start

    // START: messageStore.subscribe.stop
    function stop () {
      // eslint-disable-next-line
      console.log(`Stopped ${subscriberId}`)

      keepGoing = false
    }
    // END: messageStore.subscribe.stop

    // START: innerShell
    return {
      // <callout id="co.subscription.return" />
      loadPosition,
      start,
      stop,
      tick,
      writePosition
    }
  }
  // START: filterOnOriginMatch
  // START: shell
}
// END: innerShell
// END: filterOnOriginMatch

module.exports = configureCreateSubscription
// END: shell
