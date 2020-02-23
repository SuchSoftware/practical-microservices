# Practical Microservices Workshop

Get Hands-on with Event Sourcing and CQRS

## Machine Setup

Follow the instructions at [https://github.com/SuchSoftware/practical-microservices](https://github.com/SuchSoftware/practical-microservices)

## Slides

Go through the slides up until "Let's Build It!"

## Start the databases and make sure we can view them

* `docker-compose rm -sf`
* `docker-compose up`
* View Data DB: postgres://postgres@localhost:5432/practical_microservices
* Message Store: postgres://postgres@localhost:5433/message_store

## Step 1: Writing a message

`git checkout step-01`

1. Open `exercises/01-write-a-message.js`
2. If you try to run it, it will go boom!  So run it and watch the boom.
3. Uncomment the `// id: uuid(),` line.
4. Run it again.
5. Talk about the fields in the message
6. Check out the result in the database viewer.  Point out the connection information is in the README 
7. SLIDE - anatomy of a message

## Step 2: Exploring the Project Layout

`git checkout step-02`

1. Lots of dependency injection
2. SLIDES - Showing how it works from `src/index.js`
2. All wired together in `src/config.js`.  Be sure to peek into this file.

## Step 3: Handling Our First Message (the `Transcribe` command)

`git checkout step-03`

* Exercise `02-handle-transcribe-command.js`
* Run `node exercises/02-handle-transcribe-command.js`
* Show src/config.js - We’re passing the message store now
* Show src/transcribe-component/index.js - we’re receiving the message store now
* Back to src/transcribe-component/index.js - Show the `transcodeVideo` function
* Running the exercise gave the error `TypeError: Cannot read property 'Transcribe' of undefined`
* The code in the exercse was:

```
config.transcribeComponent.handlers
  .Transcribe(transcribe)
```
* We need something callend `handlers` on the transcribe component with a function named `Transcribe`
* Instantiate `handlers`, passing `messageStore` and have `createHandlers` receive `messageStore`:

```
function createHandlers ({ messageStore }) {
  return {}
}

function build ({ messageStore }) {
  const handlers = createHandlers({ messageStore })
  
  // ...
  
  return {
    handlers,
    start
  }
}
```

* Show that the handler key name matches the message type we’re handling
* Live code the solution

```
function createHandlers ({ messageStore }) {
  return {
    async Transcribe (transcribe) {
      const { transcribeId, uri } = transcribe.data
      const transcription = transcribeVideo(uri)

      const transcribed = {
        id: uuid(),
        type: 'Transcribed',
        metadata: {
          traceId: transcribe.metadata.traceId,
          originStreamName: transcribe.metadata.originStreamName
        },
        data: {
          transcribeId,
          uri,
          transcription
        }
      }
      const streamName = `transcribe-${videoId}`

      return messageStore.write(streamName, transcribed)
    }
  }
}
```

## Step 4: Recycling Messages

`git checkout step-04`

* Get clean database before running the exercise
* Exercise `03-double-handle-transcribe-command.js`
* What is different about this exercise?  (Double calling the handler)
* Could this ever happen?  (Crash. Redeployment. Restart.)
* How the message store code stores position
* We don’t want to reprocess messages.  (Process vs. handle)
* Anyone know what we’re missing? (idempotence)

## Step 5: Projections

`git checkout step-05`

* Slides on Idempotence and projections
* Exercise `exercises/04-projecting-the-transcription.js`
* Let’s fill out the projection
* Projections use keys that match the message types as well.  What message type do I need?

```
module.exports = {
  $init: () => ({ id: null, isTranscribed: false }),
  Transcribed (transcribeJob, transcribed) {
    transcribeJob.id = transcribed.data.transcribeId
    transcribeJob.isTranscribed = true
    transcribeJob.uri = transcribed.data.uri
    transcribeJob.transcription = transcribed.data.transcription

    return transcribeJob
  }
}
```

## Step 6: Adding the Projection to the Handler

`git checkout step-06`

* Notice in `src/transcribe-component/index.js` that we’re requiring the projection
* Show `project` function in `src/message-store/read.js`
* Show where in the handler it needs to be used and make the change to use it.

```
if (transcription.isTranscribed) {
  console.log(`[${transcribe.id}]: Already transcribed. Skipping.`)

  return true
}
```

* Re-run `exercises/03-double-handle-transcribe-command.js`, see how only 1 event gets written.

## Step 7: Subscribing to the Message Store

`git checkout step-07`

* Clean database first
* Exercise `exercises/05-write-transcribe-command.js`
* Run it, see the command
* Write subscription code

```
function build ({ messageStore }) {
  const handlers = createHandlers({ messageStore })

  const commandSubscription = messageStore.createSubscription({
    streamName: 'transcribe:command',
    handlers,
    subscriberId: 'transcribeCommandConsumer'
  })
  
  // ...
  
  function start () {
    console.log('Starting transcribe component')

    commandSubscription.start()
  }
  
  // ...
}

```

* Start the server
* Look in Message Store and see the transcribed event


## Step 8: Handle Transcode Command

`git checkout step-08`

* Exercise `exercises/06-handle-transcode-command.js`
* We’re setting aside the transcribe component now (take them back to the event model)
* Group codes this whole component
* Fill out the projection in `src/transcode-component/projection.js`

```
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
```

* Fill out the handler in `src/transcode-component/index.js`

```
function createHandlers ({ messageStore }) {
  return {
    async Transcode (transcode) {
      const transcodeId = transcode.data.transcodeId
      const streamName = `transcode-${transcodeId}`
      const transcoding = await messageStore.fetch(streamName, projection)

      if (transcoding.isTranscoded) {
        console.log(`(${transcodeId}): Already transcoded. Skipping.`)

        return true
      }

      const transcodedUri = transcodeFile(transcode.data.uri)

      const transcoded = {
        id: uuid(),
        type: 'Transcoded',
        metadata: {
          traceId: transcode.metadata.traceId,
          originStreamName: transcode.metadata.originStreamName
        },
        data: {
          transcodeId,
          uri: transcode.data.uri,
          transcodedUri
        }
      }

      return messageStore.write(streamName, transcoded)
    }
  }
}
```

## Step 9: Starting a Long-Running Process

`git checkout step-09`

* Exercise `exercises/06-handle-catalog-command.js`
* The catalog component needs to get the other 2 to do work.  How does it do it?
* We want to advance the process based off of our own events
* The projection is already filled out
* Get a Catalog command transformed into a Started event in `src/catalog-component/index.js`

```
function createCommandHandlers ({ messageStore }) {
  return {
    async Catalog (catalog) {
      const videoId = catalog.data.videoId
      const videoStreamName = `catalog-${videoId}`
      const video = await messageStore.fetch(videoStreamName, projection)

      if (video.isStarted) {
        console.log(`(${catalog.id}) Video already started. Skipping`)

        return true
      }

      const started = {
        id: uuid(),
        type: 'Started',
        metadata: {
          traceId: catalog.metadata.traceId
        },
        data: {
          videoId: catalog.data.videoId,
          uri: catalog.data.uri
        }
      }

      return messageStore.write(videoStreamName, started)
    }
  }
}
```

## Step 10: Handling Started and Telling `transcode-component` to Transcode Videos

`git checkout step-10`

* Exercise `exercises/08-handle-started-event.js`
* Respond to our own event
* It's in a new set of handlers
* Make sure to set the `originStreamName`
* We expect to see more than 1 command.  Why?  Why does it not matter?

```
function createEventHandlers ({ messageStore }) {
  return {
    async Started (started) {
      const videoId = started.data.videoId
      const streamName = `catalog-${videoId}`
      const video = await messageStore.fetch(streamName, projection)

      if (video.isTranscoded) {
        console.log(`(${started.id}) Video already transcoded. Skipping`)

        return true
      }

      const transcode = {
        id: uuid(),
        type: 'Transcode',
        metadata: {
          traceId: started.metadata.traceId,
          originStreamName: streamName
        },
        data: {
          videoId,
          uri: started.data.uri
        }
      }
      const commandStream = `transcode:command-${videoId}`

      return messageStore.write(commandStream, transcode)
    }
  }
}
```

## Step 11: Handling `transcode`'s Transcoded Event

`git checkout step-11`

* Exercise `exercises/08-handle-transcoded-event-from-us.js`
* The catalog component will drive the process off of its own events.  It shouldn’t rely on other streams for its own state
* Idempotently copy the Transcoded event to the catalog stream
* Talk about how we get the `catalog` stream from the `metadata` on an event in a `transcode` stream.

## Step 12: Handling Our Own Transcoded Event

`git checkout step-12`

* Exercise `exercises/09-handle-transcoded-event-in-catalog-stream.js`
* The handler function for this has not been scaffolded
    * Where will we put the handler?
    * What is a handler?


## Step 13: Doing the Same Thing For Transcription

`git checkout step-13`

* No exercise
* We're not doing anything new, so we're not doing this as an exercise
* But do it as a verbal exercise
    * Look in src/catalog-component/index.js.  Where would the Transcription handlers go?
    * It's the same template as what we did for Transcoded
    * And then we also handle
* Then we also handle `catalog`'s `Transcribed` event to write a `Cataloged` event


## Step 14: Subscribing to the Message Store

`git checkout step-14`

* No exercise
* We're not coding this as a group because how to write the subscription is particular to the code in this workshop.  It isn't going to teach you more about microservices.
* Do call out the `originStreamName` passed into the subscription for the `transcode` and `transcribe` handlers.
* The streamName is the category we’re subscribing to.  To handle commands, we subscribe to the :command stream


## Step 15: Touring the application changes

`git checkout step-015`

* Keeping it simple.  Anyone can upload a video.  Can’t foresee any problem with that!
* Videos are named after their id.  Can’t foresee any problems with that!
Notice that the Application’s job here is to just get the command to the message store
That’s all it has available at the moment
That’s why the view video route has the interstitial
Notice that the reads are now just like any other HTTP handler you’ve work with before.  What we’ve done is decouple our write model from our read model


## Step 16: Aggregating the results into View Data

`git checkout step-016`

* It’s just a component, but we call them out as aggregators to make the distinction
* The query needs to be idempotent.  Upserting gives us that.
