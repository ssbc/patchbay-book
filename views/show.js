const { h, Value, computed, when, map, resolve } = require('mutant')

module.exports = function BookShow (opts) {
  const {
    myKey,
    book,
    scuttle,
    blobUrl = i => i,
    avatar = i => h('div', i),
    name = i => h('div', i),
    markdown = i => i,
    goTo,
    editBtn
  } = opts

  const state = Value()
  const isPublishing = Value(false)

  scuttle.get(book.key, false, (err, data) => {
    state.set(data)
  })

  function renderSubjective(user, subjective) {
    let ratingLine = resolve(name(user)) + ' rated ' + subjective.rating
    if (subjective.ratingMax)
      ratingLine += ' / ' + subjective.ratingMax
    ratingLine += subjective.ratingType

    return [
      h('section.left',
        [avatar(user)]),
      h('section.body', [
        h('div', computed(ratingLine, markdown)),
        when(subjective.shelve,
             h('div', ['Shelve: ', subjective.shelve])),
        when(subjective.review,
             h('div', ['Review: ', computed(subjective.review, markdown)]))
      ]),
      h('section.comments', [
        map(subjective.comments, com => {
          return h('div',
                   [h('section.avatar', avatar(com.author)),
                    h('section.content', computed(com.content.text, markdown))])
        })
      ])
    ]
  }

  return h('BookShow', computed(state, state => {
    if (!state) return h('div.loading', 'Loading...')

    const { title, description, authors, image, series, seriesNo, genres, pages } = state.common

    let src = ''
    if (image)
      src = blobUrl(image.link)

    return [
      h('section.about', [
        h('h1', title),
        editBtn ? h('div.edit', editBtn) : null
      ]),
      h('Series', [
        h('a', { 'href': '#',
                 'ev-click': () => goTo({
                   page: 'books',
                   query: 'series=' + series()
                 })
               }, series),
        when(seriesNo, h('span.seriesNo', seriesNo))
      ]),
      h('Authors', [
        'Authors: ',
        h('a', { href: '#',
                 'ev-click': () => goTo({
                   page: 'books',
                   query: 'authors=' + authors()
                 })
               }, authors)
      ]),
      h('Genres', [
        'Genres: ',
        h('a', { href: '#',
                 'ev-click': () => goTo({
                   page: 'books',
                   query: 'genre=' + genres()
                 })
               }, genres)
      ]),
      h('Pages', [
        'Pages: ', pages
      ]),
      h('section.content', [
        h('Images',
          h('img', { src })),
        h('Description',
          markdown(description))
      ]),
      h('section.clear'),
      h('section.subjective', [
        computed(state.subjective, subjectives => {
          let reviews = []
          Object.keys(subjectives).forEach(user => {
            reviews.push(renderSubjective(user, subjectives[user]))
          })
          return reviews
        })
      ])
    ]
  }))
}
