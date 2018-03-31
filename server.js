const express = require('express');
const http = require("https");
const app = express();
const request = require("request");
let coinList = [ 'BTC','ETH','LTC' ];
let coinObj;

startingCoins(coinList).then(function(obj) {
  coinObj = Object.assign({}, obj);
})

function startingCoins(arr) {
  return new Promise(function(resolve,reject) {
    let coinObj = {};
    for (i=0;i<arr.length;i+=1) {
      let item = arr[i];
      apiReq(item).then(function(data) {
        coinObj[item] = data;
        if (Object.keys(coinObj).length === coinList.length) {
          resolve(coinObj);
        }
      });
    }
  });
}

// http://expressjs.com/en/starter/static-files.html
// (folder used)
app.use(express.static('client'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendfile('index.html');
});

function options(coin) {
  return { method: 'GET',
  url: 'https://www.alphavantage.co/query',
  qs: 
   { function: 'DIGITAL_CURRENCY_WEEKLY',
     symbol: coin,
     market: 'USD',
     apikey: 'JKPP45KJLSYUEIL4' },
  headers: 
   { 'postman-token': '2b944c3a-876e-cebb-68bf-fbb0d81419c9',
     'cache-control': 'no-cache' } }
}

function apiReq(coin) {
  return new Promise(function(resolve,reject) {
    request(options(coin), function (error, response, body) {
      if (error) throw new Error(error);
      let newStr = body.toString();
      let newJson = JSON.parse(newStr);
      let weeklyPrices = newJson["Time Series (Digital Currency Weekly)"];
      let arrKeys = Object.keys(weeklyPrices);
      let pricesArr = arrKeys.map(function(item) {
        let iter = weeklyPrices[item];
        let arr = [item, parseInt(iter["1a. open (USD)"])];
        return arr;
      })
      resolve(pricesArr);
    });
  });
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

app.get("/get", function (req, res) {
  let coin = req.query.coin;
  apiReq(coin).then(function(obj) {
    res.send({coin : obj});
  });
});

app.get("/getexisting", function (req, res) {
  if (coinObj) {
    console.log(coinObj);
    res.send(coinObj);
  }
});