require('console.table')

const argv = require('yargs').argv
const cheerio = require('cheerio')
const mollusc = require('mollusc')
const pluralize = require('pluralize')
const request = require('request-promise')
const url = require('url')

const ignoreWords = require('./ignore-words')

const molluscOptions = {
  replacement: ''
}

const { band, album } = argv

if (!band) {
  throw new Error('missing parameter --band')
}

function delay (ms) {
  return new Promise((resolve, reject) => setTimeout(() => resolve(), ms))
}

(async function ({ band, album }) {
  const wordMap = album ? await getAlbumWordMap({ band, album }) : await (async () => {
    const albums = await getBandAlbums({ band })
    const albumWordMaps = await Promise.all(albums.map(async (album, i) => {
      await delay(i * 1500)

      return await getAlbumWordMap({
        albumUrl: album.url
      })
    }))

    return albumWordMaps.reduce((wordMap, albumWordMap) => {
      Object.keys(albumWordMap).forEach((word) => {
        wordMap[word] = (wordMap[word] || 0) + albumWordMap[word]
      })

      return wordMap
    }, {})
  })()

  const filteredWords = getFilteredWords({ wordMap })
  const topWords = getTopWords({ wordMap, filteredWords })

  console.info()
  console.table(topWords)
})({ band, album })

async function getBandAlbums ({ band, bandUrl }) {
  bandUrl = bandUrl || (() => {
    const bandSlug = mollusc(band, molluscOptions)

    return `http://www.darklyrics.com/${bandSlug[0]}/${bandSlug}.html`
  })()

  console.info(`Looking up ${bandUrl}`)
  console.time(band)

  const response = await request.get(bandUrl)
  const $ = cheerio.load(response)

  const albums = $('div.album').toArray().map((album) => {
    const href = $(album).find('a').first().attr('href')

    return {
      title: $(album).find('h2 strong').text().replace(/"/g, ''),
      url: url.resolve(bandUrl, href.substring(0, href.indexOf('#')))
    }
  });

  console.timeEnd(band)

  return albums
}

async function getAlbumWordMap ({ band, album, albumUrl }) {
  albumUrl = albumUrl || (() => {
    const bandSlug = mollusc(band, molluscOptions)
    const albumSlug = mollusc(album, molluscOptions)

    return `http://www.darklyrics.com/lyrics/${bandSlug}/${albumSlug}.html`
  })()

  console.info(`Looking up ${albumUrl}`)
  console.time(`${band} - ${album}`)

  const response = await request.get(albumUrl)
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
