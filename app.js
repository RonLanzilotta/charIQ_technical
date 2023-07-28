// declare variables for the API call
const API_KEY = 'K0HTOOWI401WQMWH';
const SYMBOL = 'IBM';
// change this to be set dynamically by the user
const API_URL = 'https://chartiq-api-8511c706644d.herokuapp.com/api/data'

let MOVING_AVERAGE_INTERVAL = document.getElementById("movingAvgInt").defaultValue = 20;
// let MOVING_AVERAGE_INTERVAL = 20;

console.log(MOVING_AVERAGE_INTERVAL)
// select the chart element and its rendering context to enable drawn content
const chart = document.getElementById("chart")
const ctx = chart.getContext("2d")

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
        console.log(stockPrices)

        drawChart(stockPrices)

    } catch (error) {
        console.error('error fetching stock data:', error)
    }
}

function handleMovingAvgIntUpdate() {
    const inputString = document.getElementById('movingAvgInt');
    const inputNum = parseInt(inputString.value)

    MOVING_AVERAGE_INTERVAL = inputNum;
    fetchStockData()
}

function drawChart(data) {
    // Create separate arrays to store the dates and prices for mapping and dom manipulation
    const dates = data.map(entry => entry.date);
    const prices = data.map(entry => entry.price);

    // Calculate the moving average based on given interval
    const movingAverages = [];
    console.log(MOVING_AVERAGE_INTERVAL)
    for (let i = MOVING_AVERAGE_INTERVAL - 1; i < prices.length; i++) {
        const sum = prices.slice(i - MOVING_AVERAGE_INTERVAL + 1, i + 1).reduce((acc, val) => acc + val, 0);
        
        movingAverages.push(sum / MOVING_AVERAGE_INTERVAL);
    }

    // Clear the canvas
    ctx.clearRect(0, 0, chart.width, chart.height);

    // // Draw the stock price line chart
    // ctx.beginPath();
    // ctx.strokeStyle = 'blue';
    // ctx.lineWidth = 0.75;
    // ctx.moveTo(0, chart.height - (prices[0] * chart.height / Math.max(...prices)));
    // for (let i = 1; i < prices.length; i++) {
    //     ctx.lineTo(i * chart.width / (prices.length - 1), chart.height - (prices[i] * chart.height / Math.max(...prices)));
    // }
    // ctx.stroke();

    // Draw the 20-day moving average line chart
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.moveTo(0, chart.height - (movingAverages[0] * chart.height / Math.max(...prices)));
    for (let i = 1; i < movingAverages.length; i++) {
        ctx.lineTo(i * chart.width / (movingAverages.length - 1), chart.height - (movingAverages[i] * chart.height / Math.max(...prices)));
    }
    ctx.stroke();
}

fetchStockData()