let chart;
let lastYear = new Date();
lastYear.setFullYear( lastYear.getFullYear() - 1 );
let coinList = [];

$( window ).load(function() {
	$.get(`/getexisting`, function(obj) {
	  console.log(obj);
    chartBuilder();
    dataUpdate(obj);
	});
});

function dataUpdate(obj) {
	coinList = Object.keys(obj);
	//console.log(obj);
  for (i=0;i<coinList.length;i+=1) {
    let coin = coinList[i];
    chartUpdater(obj[coin],coin);
  }
};

// Socket working
let socket = io.connect('ws://fcc-stockmarket10.herokuapp.com:'+process.env.PORT);

socket.on('update', function (data) {
  console.log("socket",data);
  chartClear();
  $("#underChart").empty();
  dataUpdate(data);
});

socket.on('error', function (data) {
  window.alert(data);
});

// Chart working
function chartBuilder(arr) {
  chart = new CanvasJS.Chart("chartContainer",
    {title:{
      text: "Cryptocurrency Prices in USD"},
      axisX: {
        interval: 1,
        intervalType: "month",
        title: "Month (click in legend to remove)"},
      axisY: {
        title: "USD"},
      legend: {
        cursor:"pointer",
        horizontalAlign: "center", // "center" , "right"
        verticalAlign: "bottom",  // "top" , "bottom"
        fontSize: 25,
        itemclick: function(e){
          let coin = e.dataSeries.legendText;
          socket.emit('del coin', coin);
        }
      },
      data: [{
        dataPoints: []}]
    });
  chart.render();
}

function chartClear() {
	chart.options.data = [];
  chart.render();
}

function chartUpdater(arr,coin) {
  let dataPoints = [];
  $.each(arr, function(key, value){
    let itemDate = new Date(value[0]);
    if (itemDate > lastYear) {
		  dataPoints.push({x: itemDate, y: parseInt(value[1])});
    }
	});
	console.log(dataPoints);
	let chartData = chart.options.data;
  chartData.push({ showInLegend: true, legendText: coin, type: "line", dataPoints: dataPoints});
  chart.render();
}

// Interactivity
$("#underChart").on('click', 'button', function(event) {
    event.preventDefault();
    let coin = $(this).text();
    socket.emit('del coin', coin);
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
      $("#addText").val("");
    }
});