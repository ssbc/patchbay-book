const nest = require('depnest')
const pull = require('pull-stream')
const { h, Set, map, computed, onceTrue } = require('mutant')
const Scroller = require('pull-scroll')
const Books = require('scuttle-book/pull/books')

exports.gives = nest({
  'app.html.menuItem': true,
  'app.page.books': true
})

exports.needs = nest({
  'sbot.obs.connection': 'first',
  'app.sync.goTo': 'first',
  'app.html.scroller': 'first',
  'keys.sync.id': 'first',
  'message.html.render': 'first',
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
    return h('a', {
      'href': '#',
      'ev-click': () =>  {
        api.app.sync.goTo({
          page: 'books',
          queryKey: key,
          queryValue: value
        })
      }
    }, value)
  }

  function mapLinks(list, key)
  {
    return map(computed([list], (list) => list.sort()), l => h('li', queryLink(key, l)))
  }

  function booksPage (location) {
    const { queryKey, queryValue } = location

    const authors = Set()
    const genres = Set()
    const shelves = Set()

    const scrollerContent = h('section.content')
    const filterSection = h('section.right',
                            ['Authors:', h('ul', mapLinks(authors, "authors")),
                             'Genres:', h('ul', mapLinks(genres, "genre")),
                             'Your shelves:', h('ul', mapLinks(shelves, "shelve"))])

    const content = h('div.books', [scrollerContent, filterSection])
    const { container } = api.app.html.scroller({
      prepend: [api.book.html.button()],
      content: content
    })

    onceTrue(api.sbot.obs.connection, function(server) {
      const allBooks = Books(server)

      const myId = api.keys.sync.id()

      pull(
        allBooks(null, true, false),
        pull.drain((book) => {
          //console.log(book)
          authors.add(book.common.authors)

          let genre = book.subjective[myId].genre
          if (genre && !genres().map(g => g.toLowerCase()).includes(genre.toLowerCase()))
            genres.add(genre)

          let shelve = book.subjective[myId].shelve
          if (shelve)
            shelves.add(shelve)
        })
      )

      if (queryKey && queryValue) {
        let lowercaseQueryValue = queryValue.toLowerCase()

        // FIXME: blows up
        pull(
          allBooks(null, true, false),
          pull.filter((book) => {
            console.log(book)
            let value = book.common[queryKey]
            if (!value)
              value = book.subjective[myId][queryKey]
            if (value)
              value = value.toLowerCase()
            return value == lowercaseQueryValue
          }),
          Scroller(container, scrollerContent, api.message.html.render, true, true)
        )

        container.title = '/books ' + queryKey + ' = ' + queryValue
      }
      else
      {
        console.log("pulling books!")
        pull(
          allBooks(),
          Scroller(container, scrollerContent, api.message.html.render, true, true)
        )
      }
    })

    container.title = '/books'
    return container
  }
}
