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
  'book.html.button': 'first', // create new
  'message.html.layout': 'first'
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

  function queryLink(value)
  {
    if (value == "")
      return h('option', { selected: 'selected' })
    else
      return h('option', value)
  }

  function mapLinks(list)
  {
    return map(computed([list], (list) => list.sort()), l => queryLink(l))
  }

  function booksPage (location) {
    const { queryKey, queryValue } = location

    const authors = Set()
    authors.add("")
    const genres = Set()
    genres.add("")
    const shelves = Set()
    shelves.add("")

    const scrollerContent = h('section.content')
    const filterSection = h('section.filters',
                            [h('span.authors', ['Authors:', h('select', {
                              'ev-change': (ev) => {
                                api.app.sync.goTo({
                                  page: 'books',
                                  queryKey: "authors",
                                  queryValue: ev.target.selectedOptions[0].value
                                })
                              }
                            }, mapLinks(authors))]),
                             h('span.genres', ['Genres:', h('select', {
                               'ev-change': (ev) => {
                                 api.app.sync.goTo({
                                   page: 'books',
                                   queryKey: "genre",
                                   queryValue: ev.target.selectedOptions[0].value
                                })
                               }
                             }, mapLinks(genres))]),
                             h('span.shelves', ['Your shelves:', h('select', {
                               'ev-change': (ev) => {
                                 api.app.sync.goTo({
                                   page: 'books',
                                   queryKey: "shelve",
                                   queryValue: ev.target.selectedOptions[0].value
                                })
                               }
                             }, mapLinks(shelves))])
                            ])

    const content = h('div.books', [scrollerContent])
    const { container } = api.app.html.scroller({
      prepend: [api.book.html.button(), filterSection],
      content: content
    })

    onceTrue(api.sbot.obs.connection, function(server) {
      const allBooks = Books(server)

      const myId = api.keys.sync.id()

      let books = []

      function render(book) {
        return api.message.html.layout(book.msg, { layout: 'card', hydratedBook: book })
      }

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

          if (queryKey && queryValue) {
            let lowercaseQueryValue = queryValue.toLowerCase()

            let value = book.common[queryKey]
            if (!value)
              value = book.subjective[myId][queryKey]
            if (value)
              value = value.toLowerCase()
            if (value == lowercaseQueryValue)
              books.push(book)
          } else
            books.push(book)
        }, () => {
          console.log("pulling books!")
          pull(
            pull.values(books),
            Scroller(container, scrollerContent, render, true, true)
          )
        })
      )
    })

    container.title = '/books'
    return container
  }
}
