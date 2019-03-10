const { h, Value, computed, when } = require('mutant')

module.exports = function bookCard (opts) {
  const {
    book,
    hydratedBook,
    scuttle,
    blobUrl = () => '',
    markdown,
    goTo
  } = opts

  const state = Value()
  if (hydratedBook)
    state.set(hydratedBook)
  else
    scuttle.get(book.key, false, (err, data) => {
      state.set(data)
    })

  return h('BookCard', computed(state, state => {
    if (!state) return 'Loading...' // TODO - make nicer

    const { title, description, authors, image, series, seriesNo } = state.common

    let src = ''
    if (image)
      src = blobUrl(image.link)

    return [
      h('div.details', [
        h('Images',
          h('img', { src })),
        h('div', [
          h('h2', title),
          h('Series', [
            h('a', { 'href': '#',
                     'ev-click': () => {
                       goTo({
                         page: 'books',
                         query: 'series=' + series
                       })
                     }
                   }, series),
            when(seriesNo, h('span.seriesNo', seriesNo))
          ]),
          h('Authors',
            h('a', { href: '#',
                     'ev-click': (e) => {
                       goTo({
                         page: 'books',
                         query: 'authors=' + authors
                       })
                     }
                   }, authors)),
          // ratings
          h('Description', [
            computed(description, (d) => d ? markdown(d.length > 450 ? d.substring(0, 450) + '...' : d) : '')
          ])
        ])
      ])
    ]
  }))
}
