(async function () {
  const fs = require('fs')
  const open = require('open')
  const hasOutput = fs.existsSync('./output.json')

  if (!hasOutput) {
    console.error('No output links to open!')
    return
  }

  try {
    const outputContent = fs.readFileSync('./output.json')
    const outputArray = JSON.parse(outputContent)
    outputArray.forEach((url, id) => setTimeout(() => open(url), 1000 * id))
  } catch (e) {
    console.error('Wrong data format in output.json')
    throw e
  }
})()
