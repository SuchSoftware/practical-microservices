module.exports = {
  $init: () => ({
    id: null,
    isTranscribed: false,
    uri: null,
    transcription: null
  })

  // TODO: Add handlers for any event types that affect this projection.
  // In our present case, that's just the "Transcribed" event
}
