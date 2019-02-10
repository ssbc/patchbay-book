const nest = require('depnest')
const { h, Value, computed } = require('mutant')

exports.needs = nest({
  'app.sync.goTo': 'first'
})

module.exports = function bookCard (opts) {
  const {
    book,
    scuttle,
    blobUrl = () => ''
  } = opts

  const state = Value()
  scuttle.get(book.key, false, (err, data) => {
    state.set(data)
  })

  return h('BookCard', computed(state, state => {
    if (!state) return 'Loading...' // TODO - make nicer

    const { title, authors, image } = state.common

    let src = ''
    if (image)
      src = blobUrl(image.link)

    return [
      h('div.details', [
        h('h2', title),
        h('section.authors',
          h('a', { href: '#',
                   'ev-click': () => api.app.sync.goTo({
                     page: 'books',
                     query: 'authors=' + authors()
                   })
                 }, authors)),
        h('img', { src })
      ])
    ]
  }))
}
