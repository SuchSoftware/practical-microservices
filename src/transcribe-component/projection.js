module.exports = {
  $init: () => ({
    id: null,
    isTranscribed: false,
    uri: null,
    transcription: null
  }),

  Transcribed (transcribeJob, transcribed) {
    transcribeJob.id = transcribed.data.transcribeId
    transcribeJob.isTranscribed = true
    transcribeJob.uri = transcribed.data.uri
    transcribeJob.transcription = transcribed.data.transcription

    return transcribeJob
  }
}
