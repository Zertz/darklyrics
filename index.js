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
  const words = album ? await getAlbumWords({ band, album }) : await (async () => {
    const albums = await getBandAlbums({ band })
    const albumsWords = await Promise.all(albums.map(async (album, i) => {
      await delay((i + 1) * 2500)

      return await getAlbumWords({
        albumUrl: album.url
      })
    }))

    return albumsWords.reduce((words, albumWords) => words.concat(albumWords), [])
  })()

  const wordMap = getWordMap({ words })
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

  console.time(bandUrl)

  try {
    const response = await request.get(bandUrl)
    const $ = cheerio.load(response)

    return $('div.album').toArray().map((album) => {
      const href = $(album).find('a').first().attr('href')

      return {
        title: $(album).find('h2 strong').text().replace(/"/g, ''),
        url: url.resolve(bandUrl, href.substring(0, href.indexOf('#')))
      }
    });
  } catch (error) {
    console.error(error)

    throw error
  } finally {
    console.timeEnd(bandUrl)
  }
}

async function getAlbumWords ({ band, album, albumUrl }) {
  albumUrl = albumUrl || (() => {
    const bandSlug = mollusc(band, molluscOptions)
    const albumSlug = mollusc(album, molluscOptions)

    return `http://www.darklyrics.com/lyrics/${bandSlug}/${albumSlug}.html`
  })()

  console.time(albumUrl)

  try {
    const response = await request.get(albumUrl)
    const $ = cheerio.load(response)

    return $('div.lyrics').text().toLocaleLowerCase().replace(/\s/g, ' ').replace(/!|\?|,|\./g, '').split(' ')
  } catch (error) {
    console.error(error)

    throw error
  } finally {
    console.timeEnd(albumUrl)
  }
}

function getWordMap ({ words }) {
  return words.reduce((wordMap, word) => {
    const slug = pluralize.singular(word.endsWith('\'s') ? word.substring(0, word.length - 2) : word).toLocaleLowerCase()

    if (!slug) {
      return wordMap
    }

    wordMap[slug] = (wordMap[slug] || 0) + 1

    return wordMap
  }, {})
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
