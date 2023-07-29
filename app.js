const API_URL = 'https://chartiq-api-8511c706644d.herokuapp.com/api/data'
// Sets the Moving Average Interval to a default of 20, to be changed by the user based on input.
let MOVING_AVERAGE_INTERVAL = document.getElementById("movingAvgInt").defaultValue = 20;

// let MOVING_AVERAGE_INTERVAL = 20;

let stockPriceData

// select the chart element and its rendering context to enable drawn content
// const chart = document.getElementById("chart")
// const ctx = chart.getContext("2d")

// API call
async function fetchStockData() {
    try {
        // fetches API data dynamically and returns a Promise.
        const response = await fetch(API_URL);

        // converts to JSON after the Promise is resolved.
        const data = await response.json();
        // isolates the OHLCC data from the JSON with the 'Time Series (Daily)' key.
        const stockData = data[1]['Time Series (Daily)']
        // Object.entries() returns an array of arrays which contain two elements each, derived from the data object's key value pairs.
        // Here, .map() returns an array of objects with the date and the stock's closing price can be found by accessing 'Close' from the data object.
        const stockPrices = Object.entries(stockData).map(([date, values]) => {
            return { date, price: parseFloat(values['Close'])};
        })
        stockPriceData = stockPrices
        console.log(stockPriceData)

        console.log(stockPriceData.length)

        drawChart(stockPrices)

    } catch (error) {
        console.error('error fetching stock data:', error)
    }
}

function handleMovingAvgIntUpdate(stockPriceData) {
    const inputString = document.getElementById('movingAvgInt');
    const inputNum = parseInt(inputString.value)

    MOVING_AVERAGE_INTERVAL = inputNum;
    drawChart(stockPriceData)
}

function drawChart(data) {
    // Ratio between the device's physical pixel resolution to the CSS pixel resolution
    const dpr = window.devicePixelRatio || 1;
    const chart = document.getElementById("lineChart")
    const ctx = chart.getContext("2d")
    const grid = chart.getContext("2d")

    // Increase the resolution of the chart
    const chartWidth = chart.clientWidth * dpr;
    const chartHeight = chart.clientHeight * dpr;

    chart.width = chartWidth
    chart.height = chartHeight
    chart.style.width = chartWidth / dpr + 'px';
    chart.style.height = chartHeight / dpr + 'px';

    // document.querySelector(".fullChartContainer").style.width = `${chartWidth / dpr + 30}px`
    // document.querySelector(".chartXAxis").style.width = `${chartWidth / dpr + 30}px`
    
    ctx.scale(dpr, dpr);
    // Create separate arrays to store the dates and prices for mapping and dom manipulation
    const dates = data.map(entry => entry.date);
    const prices = data.map(entry => entry.price);

    // Calculate the moving average based on given interval
    const movingAverages = [];
    for (let i = MOVING_AVERAGE_INTERVAL - 1; i < prices.length; i++) {
        const sum = prices.slice(i - MOVING_AVERAGE_INTERVAL + 1, i + 1).reduce((acc, val) => acc + val, 0);
        
        movingAverages.push(sum / MOVING_AVERAGE_INTERVAL);
    }

    // Clear the canvas
    ctx.clearRect(0, 0, chartWidth, chartHeight);

    // Create variables for cleaner formulas below. Both variables help to adjust the height at which the lines are drawn in the canvas.
    const maxPrice = Math.max(...prices)
    const adjustHeight = maxPrice * -1.8

    // grid preference variables
    const gridQuadrantSize = 57.1;

    const xAxisDistanceGridLines = 6;
    const yAxisDistanceGridLines = 1;

    const months = ['07/22', '08/22', '09/22', '10/22', '11/22', '12/22', '01/23', '02/23', '03/23', '04/23', '05/23', '06/23', '07/23', '']

    // const xAxisStartingPoint = { number: 1, suffix: '' }
    // const yAxisStartingPoint = { number: 1, suffix: '' }

    const linesX = Math.floor(chartHeight / gridQuadrantSize)
    const linesY = Math.floor(chartWidth / gridQuadrantSize)

    // Draw X axis grid lines
    for (let i = 0; i < linesX; i++) {
        ctx.beginPath();
        ctx.lineWidth = 1;

        if( i == xAxisDistanceGridLines) {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = "#c7c7c7";
        }
    
    // Not sure what this is for yet
        if( i == linesX ) {
            ctx.moveTo(0, gridQuadrantSize * i);
            ctx.lineTo(chartWidth, gridQuadrantSize * i);
        }
        else {
            ctx.moveTo(0, gridQuadrantSize * i + 0.5);
            ctx.lineTo(chartWidth, gridQuadrantSize * i + 0.5);
        }
        ctx.stroke();

    }

    // Draw Y axis grid lines
    for (let i = 0; i < linesY; i++) {
        ctx.beginPath();
        ctx.lineWidth = 1;

        if( i == yAxisDistanceGridLines) {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = "#c7c7c7";
        }
    
    // Not sure what this is for yet
        if( i == linesY ) {
            ctx.moveTo(gridQuadrantSize * i, 0);
            ctx.lineTo(gridQuadrantSize * i, chartHeight);
        }
        else {
            ctx.moveTo(gridQuadrantSize * i + 0.5, 0);
            ctx.lineTo(gridQuadrantSize * i + 0.5, chartHeight);
        }
        ctx.stroke();

    }

    // shifts the origin of the drawn content
    ctx.translate(gridQuadrantSize, 342.6)
    // ctx.translate(gridQuadrantSize * yAxisDistanceGridLines, gridQuadrantSize * xAxisDistanceGridLines)

        // Ticks marks along the positive X-axis
    for ( i = 0; i < linesY; i++) {

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";

        // Draw a tick mark 6px long (-3 to 3)
        ctx.moveTo(gridQuadrantSize * i + 0.5, -3);
        ctx.lineTo(gridQuadrantSize * i + 0.5, 3);
        ctx.stroke();

        // Text value at that point
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(months[i], gridQuadrantSize * i -2, 15);
    }

    // Draw the stock price line chart
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 0.75;
    ctx.moveTo(0, chartHeight + adjustHeight - (prices[0] * chartHeight / maxPrice));
    for (let i = 1; i < prices.length; i++) {
        ctx.lineTo(i * chartWidth / (prices.length - 1), chartHeight + adjustHeight - (prices[i] * chartHeight / maxPrice));
    }
    ctx.stroke();

    // Draw the 20-day moving average line chart
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.moveTo(0, chartHeight + adjustHeight - (movingAverages[0] * chartHeight / maxPrice));
    for (let i = 1; i < movingAverages.length; i++) {
        ctx.lineTo(i * chartWidth / (movingAverages.length - 1), chartHeight + adjustHeight - (movingAverages[i] * chartHeight / maxPrice));
    }
    ctx.stroke();
}

// Creates an event listener on a click of the HTML button for changing the moving avg interval.
document.getElementById("changeMovingAvgInt").addEventListener("click", () => handleMovingAvgIntUpdate(stockPriceData))


fetchStockData()