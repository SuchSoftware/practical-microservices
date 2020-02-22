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
3. Uncomment line 22
4. Talk about the fields in the message
5. SLIDE - anatomy of a message
6. Ask class to do part 2 (Did anyone pick a fun message type?)

## Step 2: Exploring the Project Layout

`git checkout step-02`

1. Lots of dependency injection
2. All wired together in `src/config.js`

## Step 3: Handling Our First Message (the `Transcribe` command)

`git checkout step-03`

* Exercise `02-handle-transcribe-command.js`
* Show src/transcribe-component/index.js - we’re receiving the message store now
* Show src/config.js - We’re passing the message store now
* Back to src/transcribe-component/index.js - Show the `transcodeVideo` function
* Show that the handler key name matches the message type we’re handling
* Live code the solution

```
    Transcribe (transcribe) {
      const { videoId, uri } = transcribe.data
      const transcription = transcribeVideo(uri)

      const transcribed = {
        id: uuid(),
        type: 'Transcribed',
        metadata: {
          traceId: move.metadata.traceId,
          originStreamName: move.metadata.originStreamName
        },
        data: {
          videoId,
          transcription
        }
      }
      const streamName = `transcription-${videoId}`

      return messageStore.write(streamName, transcribed)
    }
```

## Step 4: Recycling Messages

`git checkout step-04`

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
    const projection = {
      $init: () => ({ id: null, isTranscribed: false }),

      Transcribed (transcription, transcribed) {
        transcription.isTranscribed = true

        return transcription
      }
    }

    ```

## Step 6: Adding the Projection to the Handler

`git checkout step-06`

* Notice in `src/transcribe-component/index.js` that we’re requiring the projection
* Show `src/transcribe-component/projection.js` - We need to flesh out this file. Does the projection already exist somewhere?
* Show `project` function in `src/message-store/read.js`
* Show it being used in the handler.  Note that the handler is now async.
* Move the projection over
* Re-run `exercises/03-double-handle-transcribe-command.js`, see how only 1 event gets written.

## Step 7: Handle Transcode Command

`git checkout step-07`

* Exercise `exercises/05-handle-transcode-command.js`
* We’re setting aside the transcribe component now (take them back to the event model)
* Group codes this whole component
* Given a projection with an `$init` property and a component file with the handler somewhat filled out.  Walk them through what they have to work with.

## Step 8: Starting a Long-Running Process

`git checkout step-08`

* Exercise `exercises/06-handle-catalog-command.js`
* The catalog component needs to get the other 2 to do work.  How does it do it?
* We want to advance the process based off of our own events
* The projection is already filled out
* Get a Catalog command transformed into a Started event

## Step 9: Handling Started and Telling `transcode-component` to Transcode Videos

`git checkout step-09`

* Exercise `exercises/07-handle-started-event.js`
* Respond to our own event
* Make sure to set the `originStreamName`
* Use the video’s id for the transcode stream so that idempotence works
* We expect to see more than 1 command.  Why?  Why does it not matter?

## Step 10: Handling `transcode`'s Transcoded Event

`git checkout step-10`

* Exercise `exercises/08-handle-transcoded-event-from-us.js`
* The catalog component will drive the process off of its own events.  It shouldn’t rely on other streams for its own state
* Idempotently copy the Transcoded event to the catalog stream
* Talk about how we get the `catalog` stream from the `metadata` on an event in a `transcode` stream.

## Step 11: Handling Our Own Transcoded Event

`git checkout step-11`

* Exercise `exercises/09-handle-transcoded-event-in-catalog-stream.js`
* The handler function for this has not been scaffolded
    * Where will we put the handler?
    * What is a handler?


## Step 12: Doing the Same Thing For Transcription

`git checkout step-12`

* No exercise
* We're not doing anything new, so we're not doing this as an exercise
* But do it as a verbal exercise
    * Look in src/catalog-component/index.js.  Where would the Transcription handlers go?
    * It's the same template as what we did for Transcoded
    * And then we also handle
* Then we also handle `catalog`'s `Transcribed` event to write a `Cataloged` event


## Step 13: Subscribing to the Message Store

`git checkout step-13`

* No exercise
* We're not coding this as a group because how to write the subscription is particular to the code in this workshop.  It isn't going to teach you more about microservices.
* Do call out the `originStreamName` passed into the subscription for the `transcode` and `transcribe` handlers.
* The streamName is the category we’re subscribing to.  To handle commands, we subscribe to the :command stream


## Step 14: Touring the application changes

`git checkout step-014`

* Keeping it simple.  Anyone can upload a video.  Can’t foresee any problem with that!
* Videos are named after their id.  Can’t foresee any problems with that!
Notice that the Application’s job here is to just get the command to the message store
That’s all it has available at the moment
That’s why the view video route has the interstitial
Notice that the reads are now just like any other HTTP handler you’ve work with before.  What we’ve done is decouple our write model from our read model


## Step 15: Aggregating the results into View Data

`git checkout step-015`

* It’s just a component, but we call them out as aggregators to make the distinction
* The query needs to be idempotent.  Upserting gives us that.
