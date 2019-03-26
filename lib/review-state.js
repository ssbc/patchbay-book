const { Struct, Array: MutantArray } = require('mutant')
const pick = require('lodash.pick')

module.exports = {
  emptyState,
  buildState,
  initialiseState
}

function emptyState () {
  return {
    review: '',
    rating: '',
    ratingMax: '',
    ratingType: '',
    shelves: '', // FIXME: MutantArray([]),
  }
}

function buildState (givenState) {
  if (!givenState) return emptyState()

  const state = Object.assign(
    emptyState(),
    permittedOpts(givenState)
  )

  return state
}

function initialiseState (givenState) {
  return Struct(buildState(givenState))
}

function permittedOpts (opts) {
  const permitted = 'review rating ratingMax ratingType shelves'.split(' ')

  return pick(opts, permitted)
}
