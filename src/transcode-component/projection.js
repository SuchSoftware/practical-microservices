module.exports = {
  $init: () => ({
    id: null,
    uri: null,
    transcodedUri: null,
    isTranscoded: false
  }),

  Transcoded (transcoding, transcoded) {
    transcoding.id = transcoded.data.transcodeId
    transcoding.uri = transcoded.data.uri
    transcoding.transcodedUri = transcoded.data.transcodedUri
    transcoding.isTranscoded = true

    return transcoding
  }
}
