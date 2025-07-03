const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const MAX_HISTORY = 720;
const DATA_FILE = path.join(__dirname, "data.json");

const tempHistory = [];
const humHistory = [];

function saveData() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(
      {
        temperature: tempHistory,
        humidity: humHistory,
      },
      null,
      2
    )
  );
}

function startSensor(
  scriptPath,
  humHistory,
  tempHistory,
  humRegex,
  tempRegex,
  humLabel,
  tempLabel
) {
  const proc = spawn("python3", [path.join(__dirname, scriptPath)]);
  console.log(
    `[${humLabel}/${tempLabel}] Python process started for ${scriptPath}`
  );
  let buffer = "";
  proc.stdout.on("data", (data) => {
    console.log(`[${humLabel}/${tempLabel}] RAW:`, data.toString());
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();
    lines.forEach((line) => {
      const humMatch = line.match(humRegex);
      const tempMatch = line.match(tempRegex);
      const ts = new Date().toISOString();
      if (humMatch) {
        const humValue = parseFloat(humMatch[1]);
        humHistory.push([ts, humValue]);
        if (humHistory.length > MAX_HISTORY) humHistory.shift();
        console.log(`${humLabel}: ${ts} → ${humValue}`);
        saveData();
      }
      if (tempMatch) {
        const tempValue = parseFloat(tempMatch[1]);
        tempHistory.push([ts, tempValue]);
        if (tempHistory.length > MAX_HISTORY) tempHistory.shift();
        console.log(`${tempLabel}: ${ts} → ${tempValue}`);
        saveData();
      }
    });
  });
  proc.stderr.on("data", (data) => {
    console.error(`[${humLabel}/${tempLabel}]`, data.toString());
  });
}

function getData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }
  return { temperature: [], humidity: [] };
}

//startSensor('lib/thermistor.py', tempHistory, /temperature\s*=\s*([-+\d.]+)/i, 'Température')
startSensor(
  "lib/humid.py",
  humHistory,
  tempHistory,
  /humidity:\s*(\d+)/i,
  /Temperature:\s*([-+\d.]+)/i,
  "humidity",
  "Temperature"
);

module.exports = { getData };
