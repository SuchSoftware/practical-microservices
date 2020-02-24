module.exports = {
  $init: () => ({
    id: null,
    uri: null,
    name: null,
    transcription: null
  }),

  Started (video, started) {
    video.id = started.data.videoId
    // These are uninspiring video names.  "Hey did you see the
    // Honest Movie Trailer, 53c1798e-0619-4c6c-a680-b805d669fee1,
    // yesterday?  #DemoLife
    video.name = started.data.videoId

    return video
  },

  Transcribed (video, transcribed) {
    video.transcription = transcribed.data.transcription

    return video
  },

  Transcoded (video, transcoded) {
    video.uri = transcoded.data.transcodedUri

    return video
  }
}
