const test = require('blue-tape')
const uuid = require('uuid/v4')

const { config, reset } = require('../test-helper')

test('Writing a message without expected version', t => {
  const stream = `videos-${uuid()}`
  const videoUploaded = { id: uuid(), type: 'VideoUploaded', data: {} }
  const videoTranscoded = { id: uuid(), type: 'VideoTranscoded', data: {} }

  return reset()
    .then(() => config.messageStore.write(stream, videoUploaded))
    .then(() => config.messageStore.write(stream, videoTranscoded))
    .then(() =>
      config.messageStore.read(stream).then(written => {
        t.equal(written.length, 2, 'Wrote the messages')

        t.equal(written[0].type, videoUploaded.type, 'Correct type')
        t.equal(written[1].type, videoTranscoded.type, 'Correct type')

        t.equal(written[0].position, 0, 'Correct version')
        t.equal(written[1].position, 1, 'Correct version')
      })
    )
})

test('Catches a commit conflict', t => {
  const stream = `videos-${uuid()}`
  const firstEvent = { id: uuid(), type: 'Firsted', data: {} }
  const videoUploaded = { id: uuid(), type: 'VideoUploaded', data: {} }

  return config.messageStore.write(stream, firstEvent)
    .then(() => config.messageStore.write(stream, videoUploaded, -1))
    .then(() => {
      t.fail('It did not raise the version conflict')
    })
    .catch(err => {
      t.ok(err.message.startsWith('VersionConflict'), 'It is a VersionConflict')
    })
})

test('Fetches a stream with a projection', t => {
  const videoUploadedType = 'VideoUploaded'
  const videoTranscodedType = 'VideoTranscoded'

  const video1Id = '12345'
  const stream1 = `videos-${video1Id}`
  const video1Uploaded = {
    id: uuid(),
    type: videoUploadedType,
    data: {}
  }
  const video1Transcoded = {
    id: uuid(),
    type: videoTranscodedType,
    data: {}
  }

  const video2Id = '54321'
  const stream2 = `videos-${video2Id}`
  const video2Uploaded = {
    id: uuid(),
    type: videoUploadedType,
    data: {}
  }

  const hasBeenTranscodedProjection = {
    $init: () => ({ hasBeenTranscoded: false }),
    [videoUploadedType]: (state, event) => ({
      ...state,
      id: event.streamName.split('-')[1],
    }),      
    [videoTranscodedType]: (state, event) => ({
      ...state,
      hasBeenTranscoded: true
    })
  }

  return reset()
    .then(() => config.messageStore.write(stream1, video1Uploaded))
    .then(() => config.messageStore.write(stream1, video1Transcoded))
    .then(() => config.messageStore.write(stream2, video2Uploaded))
    .then(() =>
      config.messageStore
        .fetch(stream1, hasBeenTranscodedProjection)
        .then(projectedStream => {
          t.equal(projectedStream.id, video1Id, 'Correct id')
          t.ok(projectedStream.hasBeenTranscoded, 'Has been transcoded')
        })
    )
    .then(() =>
      config.messageStore
        .fetch(stream2, hasBeenTranscodedProjection)
        .then(projectedStream => {
          t.equal(projectedStream.id, video2Id, 'Correct id')
          t.notOk(projectedStream.hasBeenTranscoded, 'Has not been transcoded')
        })
    )
})
