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
    const { title, description, authors, series, seriesNo, images, genres, pages } = resolve(state)

    const bookMsg = {
      type: 'bookclub',
      title, description, authors, series, seriesNo, genres, pages,
      images: images || {}
    }

    scuttle.async.create(bookMsg, (err, data) => {
      if (err) return console.error(err)

      afterPublish(data)
    })
  }
}
