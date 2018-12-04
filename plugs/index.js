const plugs = {
  app: {
    page: {
      gatherings: require('./app/page/books')
    }
  },
  book: { // FIXME: this is create new book
    html: {
      button: require('./book/html/button')
    },
    sync: {
      launchModal: require('./book/sync/launch-modal')
    }
  },
  message: {
    html: {
      layout: {
        'book-card': require('./message/html/layout/book-card'),
        'book-show': require('./message/html/layout/book-show')
      },
      render: {
        book: require('./message/html/render/book')
      }
    }
  },
  router: {
    sync: {
      routes: require('./router/sync/routes')
    }
  },
  styles: {
    mcss: require('./styles/mcss')
  }
}

module.exports = {
  'patchbay-book': plugs
}
