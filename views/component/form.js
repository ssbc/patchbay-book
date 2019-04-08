const { h, when, computed, resolve } = require('mutant')
const { parseLink } = require('ssb-ref')

module.exports = function BookForm (opts) {
  const {
    state,
    myKey,
    onCancel,
    publish,
    scuttleBlob,
    blobUrl = () => {},
    isEditing = false // only used to bar recps editing
  } = opts

  const isValid = computed(state, ({ title, authors }) => {
    return title && authors
  })

  return h('BookForm', [
    h('div.details', [
      h('label.title', 'Title'),
      h('input.title', {
        'ev-input': ev => state.title.set(ev.target.value),
        value: state.title
      }),
      h('label.authors', 'Authors'),
      h('input.authors', {
        'ev-input': ev => state.authors.set(ev.target.value),
        value: state.authors
      }),
      h('label.genres', 'Genres'),
      h('input.genres', {
        'ev-input': ev => state.genres.set(ev.target.value),
        value: state.genres
      }),
      h('label.series', 'Series'),
      h('div.series', [
        h('input', {
          'ev-input': ev => state.series.set(ev.target.value),
          value: state.series,
          placeholder: '(optional)'
        }),
        h('input', {
          'ev-input': ev => state.seriesNo.set(ev.target.value),
          value: state.seriesNo,
          placeholder: 'No (optional)'
        })
      ]),
      h('label.pages', 'Pages'),
      h('input.pages', {
        'ev-input': ev => state.pages.set(ev.target.value),
        value: state.pages
      }),
      h('label', 'Image'),
      h('div.image-input', [
        imageInput(),
        computed(state.images, image => {
          if (!image) return
          return h('img', { src: blobUrl(image.link) })
        })
      ]),
      h('label', 'Synopsis'),
      h('textarea', {
        'ev-input': ev => state.description.set(ev.target.value),
        value: state.description
      }),
    ]),
    h('div.actions', [
      h('button -subtle', { 'ev-click': onCancel }, 'Cancel'),
      h('button', {
        className: when(isValid, '-primary'),
        disabled: when(isValid, false, true),
        'ev-click': publish
      }, 'Publish')
    ])
  ])

  function imageInput () {
    return h('input', {
      type: 'file',
      accept: 'image/*',
      'ev-change': handleFiles
    })

    function handleFiles (ev) {
      const files = ev.target.files

      scuttleBlob.async.files(files, { stripExif: true }, (err, result) => {
        ev.target.value = ''
        if (err) {
          console.error(err)
          return
        }

        const image = Object.assign(result, parseLink(result.link))

        state.images.set(image)
      })
    }
  }
}
