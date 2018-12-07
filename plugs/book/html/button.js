const nest = require('depnest')
const { h } = require('mutant')

exports.gives = nest({
  'book.html.button': true
})

exports.needs = nest({
  'book.sync.launchModal': 'first'
})

exports.create = function (api) {
  return nest({
    'book.html.button': NewBookButton
  })

  function NewBookButton (initialState) {
    // initialState: see /lib/form-state.js

    const button = h('BookButton', [
      h('button', { 'ev-click': openModal }, 'New Book')
    ])

    return button

    function openModal () {
      api.book.sync.launchModal(initialState, button)
    }
  }
}
