const { h, Value, computed, when } = require('mutant')

module.exports = function BookShow (opts) {
  const {
    book,
    scuttle,
    avatar = i => h('div', i),
    blobUrl = i => i,
    markdown = i => i,
    goTo,
    editBtn
  } = opts

  const state = Value()
  const isPublishing = Value(false)

  scuttle.get(book.key, false, (err, data) => {
    state.set(data)
  })

  return h('BookShow', computed(state, state => {
    if (!state) return h('div.loading', 'Loading...')

    const { title, description, authors, image, series, seriesNo } = state.common

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
      h('Authors',
        h('a', { href: '#',
                 'ev-click': () => goTo({
                   page: 'books',
                   query: 'authors=' + authors()
                 })
               }, authors)),
      h('section.content', [
        h('Images',
          h('img', { src })),
        h('Description',
          markdown(description))
      ]),
      //h('footer.backlinks', {}, api.message.html.backlinks(msg)),
      /*
      h('section.subjective', [
        computed(obs.subjective, subjectives => {
          let i = 0;
          Object.keys(subjectives).forEach(user => {
            if (i++ < reviews.length) return
            reviews.push(handleSubjective(user, i, obs))
          })

          return reviews
        })
      ])
      */
    ]
  }))
}
