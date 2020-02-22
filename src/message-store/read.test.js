const test = require('blue-tape')
const uuid = require('uuid/v4')

const { config, reset } = require('../test-helper')

const makeCategory = () => uuid().replace(/-/g, '')

test('Calling read with a category returns events in the category', t => {
  const category1 = makeCategory()
  const category2 = makeCategory()

  const event1 = { id: uuid(), type: 'event1', data: {} }
  const event2 = { id: uuid(), type: 'event2', data: {} }
  const event3 = { id: uuid(), type: 'event3', data: {} }

  return reset()
    .then(() => config.messageStore.write(`${category1}-1`, event1))
    .then(() => config.messageStore.write(`${category2}-1`, event2))
    .then(() => config.messageStore.write(`${category1}-2`, event3))
    .then(() =>
      config.messageStore.read(category1).then(messages => {
        t.equal(messages.length, 2, 'Asked for and received 2 messages')
        t.notOk(
          messages.find(m => !m.streamName.includes(category1)),
          'All belong to category1'
        )
      })
    )
})

test('It reads the last message in a stream', t => {
  const stream1 = `${makeCategory()}-${uuid()}`
  const stream2 = `${makeCategory()}-${uuid()}`

  const event1 = { id: uuid(), type: 'event1', data: {} }
  const event2 = { id: uuid(), type: 'event2', data: {} }
  const event3 = { id: uuid(), type: 'event3', data: {} }
  const event4 = { id: uuid(), type: 'event4', data: {} }

  return reset()
    .then(() => config.messageStore.write(stream1, event1))
    .then(() => config.messageStore.write(stream1, event2))
    .then(() => config.messageStore.write(stream1, event3))
    .then(() => config.messageStore.write(stream2, event4))
    .then(() =>
      config.messageStore.readLastMessage(stream1).then(message => {
        t.ok(message, 'It found one')
        t.equal(message.type, event3.type, 'It was event3')
      })
    )
})

test('It reads from the $all stream', t => {
  const event1 = { id: uuid(), type: 'event1', data: { hi: 'there' } }
  const event2 = { id: uuid(), type: 'event2', data: { hi: 'there' } }
  const event3 = { id: uuid(), type: 'event3', data: { hi: 'there' } }

  // These need to be different categories
  const entityType = makeCategory()
  const streamName1 = `${entityType}-${uuid()}`
  const streamName2 = `${entityType}:command-${uuid()}`
  const streamName3 = `${uuid()}+position`

  return reset()
    .then(() => config.messageStore.write(streamName1, event1))
    .then(() => config.messageStore.write(streamName2, event2))
    .then(() => config.messageStore.write(streamName3, event3))
    .then(() =>
      config.messageStore.read('$all').then(messages => {
        t.ok(messages.find(m => m.id === event1.id), 'Found first event')
        t.ok(messages.find(m => m.id === event2.id), 'Found second event')
        t.ok(messages.find(m => m.id === event3.id), 'Found 3rd evet')
      })
    )
})
