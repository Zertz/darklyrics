require('console.table')

const cheerio = require('cheerio')
const mollusc = require('mollusc')
const pluralize = require('pluralize')
const request = require('request-promise')
const argv = require('yargs').argv

const ignoreWords = require('./ignore-words')

const molluscOptions = {
  replacement: ''
}

const { band, album } = argv

if (!band) {
  throw new Error('missing parameter --band')
}

(async function ({ band, album }) {
  if (album) {
    const wordMap = await getAlbumWordMap({ band, album })
    const filteredWords = getFilteredWords({ wordMap })
    const topWords = getTopWords({ wordMap, filteredWords })

    console.info()
    console.table(topWords)
  } else {
    const albums = await getBandAlbums({ band })
    const albumWordMaps = await Promise.all(albums.map(async (album) => await getAlbumWordMap({ band, album })))

    const wordMap = albumWordMaps.reduce((wordMap, albumWordMap) => {
      Object.keys(albumWordMap).forEach((word) => {
        wordMap[word] = (wordMap[word] || 0) + albumWordMap[word]
      })

      return wordMap
    }, {})

    const filteredWords = getFilteredWords({ wordMap })
    const topWords = getTopWords({ wordMap, filteredWords })

    console.info()
    console.table(topWords)
  }
})({ band, album })

async function getBandAlbums ({ band }) {
  const bandSlug = mollusc(band, molluscOptions)

  const url = `http://www.darklyrics.com/${bandSlug[0]}/${bandSlug}.html`

  console.info(`Looking up ${url}`)
  console.time(band)

  const response = await request.get(url)
  const $ = cheerio.load(response)

  const albums = $('div.album h2 strong').text().split('""').map((album) => album.replace(/"/g, ''))

  console.timeEnd(band)

  return albums
}

async function getAlbumWordMap ({ band, album }) {
  const bandSlug = mollusc(band, molluscOptions)
  const albumSlug = mollusc(album, molluscOptions)

  const url = `http://www.darklyrics.com/lyrics/${bandSlug}/${albumSlug}.html`

  console.info(`Looking up ${url}`)
  console.time(`${band} - ${album}`)

  const response = await request.get(url)
  const $ = cheerio.load(response)

  const lyrics = $('div.lyrics').text().toLocaleLowerCase().replace(/\s/g, ' ').replace(/!|\?|,|\./g, '')
  const wordMap = {}

  lyrics.split(' ').forEach((word) => {
    const slug = pluralize.singular(word.endsWith('\'s') ? word.substring(0, word.length - 2) : word).toLocaleLowerCase()

    wordMap[slug] = (wordMap[slug] || 0) + 1
  })

  console.timeEnd(`${band} - ${album}`)

  return wordMap
}

function getFilteredWords ({ wordMap }) {
  return Object.keys(wordMap).filter((word) => {
    if (word.startsWith('[') && word.endsWith(']')) {
      return false
    }

    return word.length > 2 && wordMap[word] > 2 && ignoreWords.indexOf(word) === -1
  })
}

function getTopWords ({ wordMap, filteredWords }) {
  return filteredWords.map((word, i) => {
    const related = filteredWords.filter((w) => {
      return w !== word && (w.indexOf(word) === 0 || word.indexOf(w) === 0)
    }).reduce((value, word) => {
      const currentValue = `${word} (${wordMap[word]})`

      return value.length === 0 ? currentValue : `${value}, ${currentValue}`
    }, '')

    return {
      word,
      count: wordMap[word],
      related
    }
  }).sort((a, b) => {
    return b.count === a.count ? a.word.localeCompare(b.word) : b.count - a.count
  }).filter((word, i) => i < 25).map((word, i) => Object.assign({
    rank: i + 1
  }, word))
}
