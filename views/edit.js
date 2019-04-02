const { resolve } = require('mutant')
const isEqual = require('lodash.isequal')
const { initialiseState, buildState } = require('../lib/form-state')
const Form = require('./component/form')

module.exports = function BookEdit (opts) {
  const {
    book,
    scuttle,
    scuttleBlob,
    blobUrl,
    afterPublish = console.log,
    onCancel = () => {}
  } = opts

  var state = {
    current: initialiseState(),
    next: initialiseState()
  }
  fetchCurrentState()

  return Form({
    state: state.next,
    onCancel,
    publish,
    scuttleBlob,
    blobUrl,
    isEditing: true
  })

  function fetchCurrentState () {
    scuttle.get(book, false, (err, _state) => {
      if (err) return console.error(err)

      state.current.set(buildState(_state.common))
      state.next.set(buildState(_state.common))
    })
  }

  function publish () {
    const n = resolve(state.next)
    const c = resolve(state.current)

    const { title, description, authors, series, seriesNo, images, genres, pages } = c

    if (!isEqual(c, n)) {
      scuttle.async.update(book,
                           { title, description, authors, series, seriesNo, images, genres, pages },
                           (err, data) => {
        if (err) return console.error(err)

        afterPublish(data)
      })
    } else
      afterPublish()
  }
}
