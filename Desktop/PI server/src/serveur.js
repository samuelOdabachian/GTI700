const express = require('express');
const app = express();
const path = require('path');

// Grab the port from command line args
const PORT = process.argv[2] || 3000;


const sensorData = {
    temperature: 22.5,
    humidity: 55,
};

// Get temperature
app.get('/temperature', (req, res) => {

    res.json({ temperature: sensorData.temperature });
});

//  Get humidity
app.get('/humidity', (req, res) => {
    res.json({ humidity: sensorData.humidity });
});


app.get('/:entree/:nVal', function (req, res) {

    const entree = req.params.entree;
    const n = req.params.nVal;

    res.json(getHistory(entree, n));

})

app.get('/temperature/:nVal/moy',function (req, res){

    const n = req.params.nVal;

    res.json(moyenne("temperature",n));
})

app.get('/humidity/:nVal/moy',function (req, res){

    const n = req.params.nVal;

    res.json({ value: moyenne("humidity", n).value + "%" });
})



app.get('/affichage',function (req, res){
    res.sendFile(path.join(__dirname, 'affichage.html'));
})


app.listen(PORT, () => {
    console.log(`Serveur Express en écoute sur le port ${PORT}`);
});


//Snapshot chaque x secondes
const history = new Map();
let counter = 0;

setInterval(() => {
    const snapshot = {...sensorData};
    const date = new Date(Date.now());
    const timestamp= date.toLocaleString();
    history.set(timestamp, snapshot);
    counter++;

    //Start purging old history after 1 hour.
    if (counter >= 360){
        const keys = Array.from(history.keys());
        const lastKey = keys[keys.length - 1];
        history.delete(lastKey);
    }
}, 10000);

function moyenne(entree,n){
    const historyArray = getHistory(entree,n);

    let sum = 0;
    if (historyArray.length === 0) {
      return { value: "N/A" }
    }
    for (let i = 0; i < historyArray.length; i++) {
        sum += historyArray[i][1];
    }
    const moyenne = sum / historyArray.length;
    return { value: moyenne };
}

function getHistory(entree, n){
    const reqValues = Array.from(history.entries()).slice(n *-1);
    const humidityHistory = reqValues.map(([time, data]) => [time, data[entree]]);

    return humidityHistory;
}