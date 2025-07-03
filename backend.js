const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

// Ajout du middleware CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Grab the port from command line args
const PORT = process.argv[2] || 3000;
const API_PREFIX = "/GTI700";
const DATA_FILE = path.join(__dirname, "data.json");

function getData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }
  return { temperature: [], humidity: [] };
}
// Get temperature
app.get(API_PREFIX + "/temperature", (req, res) => {
  const data = getData();
  const last = data.temperature[data.temperature.length - 1];
  res.json({ temperature: last ? last[1] : null });
});

//  Get humidity
app.get(API_PREFIX + "/humidity", (req, res) => {
  const data = getData();
  const last = data.humidity[data.humidity.length - 1];
  res.json({ humidity: last ? last[1] : null });
});

app.get(API_PREFIX + "/:entree/:nVal", function (req, res) {
  const entree = req.params.entree;
  const n = parseInt(req.params.nVal);
  const data = getData();
  let history = [];
  if (entree === "temperature" || entree === "humidity") {
    history = data[entree].slice(-n);
  }
  res.json(history);
});

app.get(API_PREFIX + "/temperature/:nVal/moy", function (req, res) {
  const n = parseInt(req.params.nVal);
  const data = getData();
  const arr = data.temperature.slice(-n);
  if (arr.length === 0) return res.json({ value: "N/A" });
  const sum = arr.reduce((acc, v) => acc + v[1], 0);
  res.json({ value: sum / arr.length });
});

app.get(API_PREFIX + "/humidity/:nVal/moy", function (req, res) {
  const n = parseInt(req.params.nVal);
  const data = getData();
  const arr = data.humidity.slice(-n);
  if (arr.length === 0) return res.json({ value: "N/A" });
  const sum = arr.reduce((acc, v) => acc + v[1], 0);
  res.json({ value: sum / arr.length + "%" });
});

app.get(API_PREFIX + "/affichage", function (req, res) {
  res.sendFile(path.join(__dirname, "affichage.html"));
});

app.listen(PORT, () => {
  console.log(`Serveur Express en écoute sur le port ${PORT}`);
});
