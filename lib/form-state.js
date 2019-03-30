const { Dict, Struct, Array: MutantArray } = require('mutant')
const pick = require('lodash.pick')

module.exports = {
  emptyState,
  buildState,
  initialiseState
}

function emptyState () {
  return {
    title: '',
    description: '',
    authors: MutantArray([]),
    series: '',
    seriesNo: '',
    images: '', // FIXME: MutantArray([]),
    genres: '',
    pages: '',
    reviews: Dict()
  }
}

function buildState (givenState) {
  if (!givenState) return emptyState()

  const state = Object.assign(
    emptyState(),
    permittedOpts(givenState)
  )

  if (typeof state.authors === 'string')
    state.authors = [state.authors]

  return state
}

function initialiseState (givenState) {
  return Struct(buildState(givenState))
}

function permittedOpts (opts) {
  const permitted = 'title description authors series seriesNo images genres pages reviews'.split(' ')

  return pick(opts, permitted)
}
