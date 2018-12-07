const { resolve } = require('mutant')
const { initialiseState, emptyState } = require('../lib/form-state')
const Form = require('./component/form')

module.exports = function BookNew (opts) {
  const {
    initialState,
    scuttle,
    scuttleBlob,
    myKey,
    blobUrl,
    afterPublish = console.log,
    onCancel = () => {}
  } = opts

  var state = initialiseState(initialState)

  return Form({
    state,
    myKey,
    onCancel,
    publish,
    scuttleBlob,
    blobUrl
  })

  function publish () {
    const { title, description, location, image, day, time, progenitor, mentions, recps } = resolve(state)

    if (description) opts.description = description
    if (location) opts.location = location
    if (image) opts.image = image
    if (progenitor) opts.progenitor = progenitor

    scuttle.post(opts, (err, data) => {
      if (err) return console.error(err)

      state.set(emptyState())
      afterPublish(data)
    })
  }
}
