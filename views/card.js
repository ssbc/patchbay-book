const { h, Value, computed } = require('mutant')

module.exports = function bookCard (opts) {
  const {
    book,
    scuttle,
    blobUrl = () => ''
  } = opts

  const state = Value()
  scuttle.get(book.key, (err, data) => {
    if (err) throw (err)

    state.set(data)
  })

  return h('BookCard', computed(state, state => {
    if (!state) return 'Loading...' // TODO - make nicer

    const { title, authors, images } = state

    return [
      h('div.details', [
        h('h2', title),
        h('section.authors',
          h('a', { 'href': '#',
                   'ev-click': () => api.app.sync.goTo({
                     page: 'books',
                     query: 'authors=' + authors()
                   })
                 }, authors)),
        h('img', {src: blobUrl(image.link)})
      ])
    ]
  }))
}
