const uuid = require('uuid/v4')

const { project } = require('../src/message-store/read')
const TranscribedControls = require('../src/transcribe-component/controls/events/transcribed')
// TODO: Fill out the projection required here
const projection = require('../src/transcribe-component/projection')

const events = [TranscribedControls.example()]

const transcription = project(events, projection)

console.log({ transcription })
console.log(
  'Has the file been transcribed?',
  transcription.isTranscribed ? 'Yes' : 'No'
)
