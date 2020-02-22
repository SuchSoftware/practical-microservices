const test = require('blue-tape')
const uuid = require('uuid/v4')

const { config, reset } = require('../test-helper')

test('Subscribe resumes from the last position', t => {
  const subscriberId = 'subscriberId'
  const category = `stream${uuid().replace(/-/g, '')}`
  const streamName = `${category}-123`

  let handledMessageCount = 0
  const handlers = {
    test: () => {
      handledMessageCount++

      return Promise.resolve(true)
    }
  }

  const subscription = config.messageStore.createSubscription({
    streamName: category,
    handlers,
    subscriberId
  })

  const testMessage = () => ({ id: uuid(), type: 'test', data: {} })

  return reset()
    .then(() => config.messageStore.write(streamName, testMessage()))
    .then(() => config.messageStore.write(streamName, testMessage()))
    .then(() => config.messageStore.readLastMessage(streamName))
    .then(lastMessage => subscription.writePosition(lastMessage.globalPosition))
    .then(() => config.messageStore.write(streamName, testMessage()))
    .then(() => config.messageStore.write('otherStream', testMessage()))
    .then(() => config.messageStore.write('otherStream', testMessage()))
    .then(() => config.messageStore.write('otherStream', testMessage()))
    .then(() => subscription.loadPosition())
    .then(() => subscription.tick())
    .then(() => {
      t.equal(
        handledMessageCount,
        1,
        'Only saw 1 message because store resumed'
      )
    })
})

test('Subscribe assumes starting point of 0 if no position saved', t => {
  const subscriberId = uuid()
  const category = `stream${uuid().replace(/-/g, '')}`
  const streamName = `${category}-123`

  let handledMessageCount = 0
  const handlers = {
    test: () => {
      handledMessageCount++

      return Promise.resolve(true)
    }
  }

  const subscription = config.messageStore.createSubscription({
    streamName: category,
    handlers,
    subscriberId
  })

  const testMessage = () => ({ id: uuid(), type: 'test', data: {} })

  return reset()
    .then(() => config.messageStore.write(streamName, testMessage()))
    .then(() => config.messageStore.write(streamName, testMessage()))
    .then(() => config.messageStore.write(streamName, testMessage()))
    .then(() => subscription.loadPosition())
    .then(() => subscription.tick())
    .then(() => {
      t.equal(
        handledMessageCount,
        3,
        'Saw all 3 messages'
      )
    })
})
