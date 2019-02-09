const nest = require('depnest')
const pull = require('pull-stream')
const { h, Set, map, computed } = require('mutant')
const Scroller = require('pull-scroll')
const allBooks = require('scuttle-book/pull/books')

exports.gives = nest({
  'app.html.menuItem': true,
  'app.page.books': true
})

exports.needs = nest({
  'about.obs': {
    latestValue: 'first',
    valueFrom: 'first'
  },
  'app.sync.goTo': 'first',
  'app.html.scroller': 'first',
  'keys.sync.id': 'first',
  'message.html.render.book': 'first',
  'book.html.button': 'first' // create new
})

exports.create = function (api) {
  return nest({
    'app.html.menuItem': menuItem,
    'app.page.books': booksPage
  })

  function menuItem (handleClick) {
    return h('a', {
      style: { order: 0 },
      'ev-click': () => handleClick({ page: 'books' })
    }, '/books')
  }

  function queryLink(key, value)
  {
    return h('a', { 'href': '#',
                    'ev-click': () => api.app.sync.goTo({
                      page: 'books',
                      queryKey: key,
                      queryValue: value
                    })
                  }, value)
  }

  function mapLinks(list, key)
  {
    return map(computed([list], (list) => list.sort()), l => h('li', queryLink(key, l)))
  }

  function latestValue(msg, key)
  {
    let originalValue = msg.value.content[key]
    let latestAbout = api.about.obs.latestValue(msg.key, key)()
    return latestAbout || originalValue
  }

  function booksPage (location) {
    const { queryKey, queryValue } = location
    const scrollerContent = h('section.content')

    const authors = Set()
    const genres = Set()
    const shelves = Set()

    const filterSection = h('section.right',
                            ['Authors:', h('ul', mapLinks(authors, "authors")),
                             'Genres:', h('ul', mapLinks(genres, "genre")),
                             'Your shelves:', h('ul', mapLinks(shelves, "shelve"))])

    pull(
      allBooks(),
      pull.filter(msg => msg.key),
      pull.drain((msg) => {
        authors.add(latestValue(msg, 'authors'))

        let genre = latestValue(msg, 'genre')
        if (genre && !genres().map(g => g.toLowerCase()).includes(genre.toLowerCase()))
          genres.add(genre)

        shelves.add(api.about.obs.valueFrom(msg.key, "shelve", api.keys.sync.id())())
      })
    )

    const content = h('div.books', [scrollerContent, filterSection])

    const { container } = api.app.html.scroller({prepend: [api.book.html.button()], content: content})

    if (queryKey && queryValue) {
      let lowercaseQueryValue = queryValue.toLowerCase()

      pull(
        allBooks(),
        pull.filter(msg => msg.key),
        pull.filter((msg) => {
          let originalValue = msg.value.content[queryKey]
          let latestAbout = api.about.obs.latestValue(msg.key, queryKey)()
          let value = (latestAbout || originalValue) ? (latestAbout || originalValue).toLowerCase() : ''

          return value == lowercaseQueryValue
        }),
        Scroller(container, scrollerContent, api.message.html.render.book, true, true)
      )

      container.title = '/books ' + queryKey + ' = ' + queryValue

    } else {
      pull(
        allBooks(),
        Scroller(container, scrollerContent, api.message.html.render.book, true, true)
      )

      container.title = '/books'
    }

    return container
  }
}
