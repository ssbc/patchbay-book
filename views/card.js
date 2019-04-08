const { h, Value, computed, when, map } = require('mutant')

module.exports = function bookCard (opts) {
  const {
    book,
    hydratedBook,
    myId,
    scuttle,
    blobUrl = () => '',
    avatar = i => h('div', i),
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

    const { title, description, authors, images, series, seriesNo } = state.common

    let src = ''
    if (images)
      src = blobUrl(images.link)

    let ratingLine = ''
    const review = state.reviews[myId]
    if (review && review.rating) {
      ratingLine = 'You rated ' + review.rating
      if (review.ratingMax)
        ratingLine += ' / ' + review.ratingMax
      ratingLine += review.ratingType
    }

    return [
      h('div.details', [
        h('Images', [
          h('img', { src }),
          markdown(ratingLine)
        ]),
        h('div', [
          h('h2', title),
          h('Series', [
            h('a', { 'href': '#', 'ev-click': () => {
              goTo({ page: 'books', query: 'series=' + series })
            } }, series),
            when(seriesNo, h('span.seriesNo', seriesNo))
          ]),
          h('Authors',
            h('a', { href: '#', 'ev-click': (e) => {
              goTo({ page: 'books', query: 'authors=' + authors })
            } }, authors)),
          h('Description', [
            computed(description, (d) => d ? markdown(d.length > 450 ? d.substring(0, 450) + '...' : d) : '')
          ])
        ]),
        h('div.readers', [
          "Readers",
          h('div', map(state.readers, reader => avatar(reader)))
        ])
      ]),
    ]
  }))
}
