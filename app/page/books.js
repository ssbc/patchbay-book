const nest = require('depnest')
const pull = require('pull-stream')
const { h, Set, map, computed } = require('mutant')
const Scroller = require('pull-scroll')

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
  'book.pull.getAll': 'first',
  'book.html': {
    create: 'first',
    render: 'first'
  }
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
                      query: key + '=' + value
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

  function booksPage (path) {
    const creator = api.book.html.create({})
    const scrollerContent = h('section.content')

    const authors = Set()
    const genres = Set()
    const shelves = Set()

    const filterSection = h('section.right',
                            ['Authors:', h('ul', mapLinks(authors, "authors")),
                             'Genres:', h('ul', mapLinks(genres, "genre")),
                             'Your shelves:', h('ul', mapLinks(shelves, "shelve"))])

    pull(
      api.book.pull.getAll(),
      pull.filter(msg => msg.key),
      pull.drain((msg) => {
        authors.add(latestValue(msg, 'authors'))
        genres.add(latestValue(msg, 'genre'))
        shelves.add(api.about.obs.valueFrom(msg.key, "shelve", api.keys.sync.id())())
      })
    )

    const content = h('div.books', [scrollerContent, filterSection])

    const { container } = api.app.html.scroller({prepend: [creator], content: content})

    if (path.query) {
      const [ qkey, qvalue ] = path.query.split("=")

      pull(
        api.book.pull.getAll(),
        pull.filter(msg => msg.key),
        pull.filter((msg) => {
          let originalValue = msg.value.content[qkey]
          let latestAbout = api.about.obs.latestValue(msg.key, qkey)()
          return (latestAbout || originalValue) == qvalue
        }),
        Scroller(container, scrollerContent, api.book.html.render, true, true)
      )

      container.title = '/books?' + path.query

    } else {
      pull(
        api.book.pull.getAll(),
        Scroller(container, scrollerContent, api.book.html.render, true, true)
      )

      container.title = '/books'
    }

    return container
  }
}
