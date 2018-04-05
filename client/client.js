let chart;
let lastYear = new Date();
lastYear.setFullYear( lastYear.getFullYear() - 1 );
let coinList = [];

var socket = io.connect();

socket.on('add coin', function (data) {
  console.log("socket",data);
});

$( window ).load(function() {
	$.get(`/getexisting`, function(obj) {
	  let coins = Object.keys(obj);
	  console.log(obj);
    chartBuilder();
    for (i=0;i<coins.length;i+=1) {
      let coin = coins[i];
      console.log(coin);
      coinList.push(coin);
      chartUpdater(obj[coin]);
      buttonBuilder(coin);
    }
	});
});

function chartBuilder(arr) {
  chart = new CanvasJS.Chart("chartContainer",
    {title:{
      text: "Cryptocurrency Prices in USD"},
      axisX: {
        interval: 1,
        intervalType: "month",
        title: "Month"},
      axisY: {
        title: "USD"},
       data: [{
        dataPoints: []}]
    });
  chart.render();
}

function chartUpdater(arr) {
  let dataPoints = [];
  $.each(arr, function(key, value){
    let itemDate = new Date(value[0]);
    if (itemDate > lastYear) {
		  dataPoints.push({x: itemDate, y: parseInt(value[1])});
    }
	});
	console.log(dataPoints);
	let chartData = chart.options.data;
  chartData.push({ type: "line", dataPoints: dataPoints});
  chart.render();
}

function buttonBuilder(coin) {
  let HTMLStr = `<button id="${coin}Butt">${coin}</button><br>`
  $("#underChart").append(HTMLStr);
}

$("#underChart").on('click', 'button', function(event) {
    event.preventDefault();
    let loc = $("#locInput").val();
    $.get(`/search?city=${loc}`, function(obj) {
      //console.log("pollspace",obj);
      displayResults(obj);
    });
});

$("#addButt").on('click', function(event) {
    event.preventDefault();
    let coin = $("#addText").val().toUpperCase();
    if (!coin) {
      window.alert("Please enter the code of an existing coin")
    } else if (coinList.includes(coin)) {
      window.alert("This coin is already listed")
    } else {
      console.log(`/add?coin=${coin}`);
      socket.emit('add coin', coin);
      $.get(`/add?coin=${coin}`, function(obj) {
        if (obj[coin] === "invalid") {
          window.alert(`Sorry, couldnt find any data for ${coin}, try another one`);
        } else {
          console.log("newCoin",obj);
          buttonBuilder(coin);
          chartUpdater(obj[coin]);
        }
      });
    }
});