require('dotenv').config()
const puppeteer = require('puppeteer')
const fs = require('fs')

function getDataSources () {
  const { COMMUNITIES } = process.env
  const groupIds = COMMUNITIES.split(',').filter(el => !!el)

  return groupIds.map(groupId =>
    `https://vk.com/search?c%5Bage_from%5D=19&c%5Bage_to%5D=22&c%5Bcity%5D=1&c%5Bcountry%5D=1&c%5Bgroup%5D=${groupId}&c%5Bname%5D=1&c%5Bper_page%5D=40&c%5Bphoto%5D=1&c%5Bsection%5D=people&c%5Bsex%5D=1`
  )
}

async function autoScroll (page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0
      var distance = 100
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance

        if(totalHeight >= scrollHeight){
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })
}

async function parseData (page) {
  const ids = await page.evaluate((containerId) => {
    const resultContainer = document.getElementById(containerId)
    ids = [...resultContainer.children].map(child => child.dataset.id).filter(a => !!a)
    return ids
  }, 'results')

  return new Set(ids)
}

/// method from MDN
function intersection (setA, setB) {
  var _intersection = new Set()
  for (var elem of setB) {
      if (setA.has(elem)) {
          _intersection.add(elem)
      }
  }
  return _intersection
}

(async () => {
  const dataSources = getDataSources()
  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.BROWSERWSENDPOINT,
    defaultViewport: null,
    headless: true
  })

  const dataSets = await Promise.allSettled(dataSources.map(async source => {
    const page = await browser.newPage()
    try {
      await page.goto(
        source,
        { waitUntil: 'networkidle0' }
      )

      if (process.env.ONE_PAGE !== 'true')
        await autoScroll(page)

      const data = await parseData(page)

      return data
    } catch (e) {
      console.error(e)
      return new Set()
    } finally {
      await page.close()
    }
  }))

  await browser.disconnect()

  const finalSet = new Array(...createFinalSet(dataSets))
  writeOutput(finalSet)
})()

function writeOutput (data, formatter = defaultFormatter) {
  const hasOutput = fs.existsSync('./output.json')

  if (!hasOutput)
    fs.appendFileSync('./output.json', '')
  
  fs.writeFileSync('./output.json', JSON.stringify(formatter(data)))
}

function defaultFormatter (data) {
  return data.map(id => `https://vk.com/id${id}`)
}

function createFinalSet (dataSets) {
  let resultSet = dataSets[0].value
  for (let i = 1; i < dataSets.length; i++) {
    resultSet = intersection(resultSet, dataSets[i].value)
  }
  console.log('createFinalSet: ', resultSet, dataSets)
  return resultSet
}
