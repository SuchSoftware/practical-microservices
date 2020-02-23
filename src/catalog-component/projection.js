module.exports = {
  $init: () => ({
    id: null,
    uri: null,
    transcodedUri: null,
    transcription: '',
    isStarted: false,
    isTranscoded: false,
    isTranscribed: false,
    isCataloged: false
  }),

  Started (video, started) {
    video.id = started.data.videoId
    video.uri = started.data.uri
    video.isStarted = true

    return video
  },

  Transcribed (video, transcribed) {
    video.isTranscribed = true
    video.transcription = transcribed.data.transcription

    return video
  },

  Transcoded (video, transcoded) {
    video.isTranscoded = true
    video.transcodedUri = transcoded.data.transcodedUri

    return video
  },

  Cataloged (video, cataloged) {
    video.isCataloged = true

    return video
  }
}
