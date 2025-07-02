const { spawn } = require('child_process')

const INTERVAL = 3000
const MAX_HISTORY = 720

const tempHistory = []
const humHistory = []

function readSensor(command, args, regex, history) {
  const proc = spawn(command, args)
  let output = ''
  proc.stdout.on('data', data => { output += data.toString() })
  proc.on('close', () => {
    const match = output.match(regex)
    if (match) {
      const value = parseFloat(match[1])
      const ts = new Date().toISOString()
      history.push([ts, value])
      if (history.length > MAX_HISTORY) history.shift()
      console.log(`${ts}  ${value}`)
    } else {
      console.error(`Parsing error:\n${output}`)
    }
  })
}

setInterval(() => {
  readSensor('python3', ['lib/thermistor.py'], /temperature\s*=\s*([-+\d.]+)/i, tempHistory)
  readSensor('python3', ['lib/humid.py'],      /humidity:\s*(\d+)/i,        humHistory)
}, INTERVAL)
