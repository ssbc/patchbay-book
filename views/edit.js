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

      state.current.set(buildState(_state))
      state.next.set(buildState(_state))
    })
  }

  function publish () {
    const n = resolve(state.next)
    const c = resolve(state.current)

    // FIXME: maybe look if there were any changes

    scuttle.put(book, n, (err, data) => {
      if (err) return console.error(err)

      fetchCurrentState()
      afterPublish(data)
    })
  }
}
