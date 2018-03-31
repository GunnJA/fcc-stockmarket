let chart;
let lastYear = new Date();
lastYear.setFullYear( lastYear.getFullYear() - 1 );

$( window ).load(function() {
	$.get(`/getexisting`, function(obj) {
	  let coins = Object.keys(obj);
	  console.log(obj);
    chartBuilder();
    for (i=0;i<coins.length;i+=1) {
      let coin = coins[i];
      console.log(coin);
      chartUpdater(obj[coin]);
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

