const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const MAX_HISTORY = 720
const DATA_FILE = path.join(__dirname, 'data.json')

const tempHistory = []
const humHistory  = []

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    temperature: tempHistory,
    humidity: humHistory
  }, null, 2))
}

function startSensor(scriptPath, history, regex, label) {
  const proc = spawn('python3', [ path.join(__dirname, scriptPath) ])
  let buffer = ''
  proc.stdout.on('data', data => {
    buffer += data.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop()
    lines.forEach(line => {
      const m = line.match(regex)
      if (m) {
        const value = parseFloat(m[1])
        const ts    = new Date().toISOString()
        history.push([ts, value])
        if (history.length > MAX_HISTORY) history.shift()
        console.log(`${label}: ${ts} → ${value}`)
        saveData()
      }
    })
  })
  proc.stderr.on('data', data => {
    console.error(`[${label}]`, data.toString())
  })
}

function getData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  }
  return { temperature: [], humidity: [] }
}

startSensor('lib/thermistor.py', tempHistory, /temperature\s*=\s*([-+\d.]+)/i, 'Température')
//startSensor('lib/humid.py',      humHistory,      /humidity:\s*(\d+)/i,          'Humidité')

module.exports = { getData }
console.log('dataSub.js exports:', module.exports);
