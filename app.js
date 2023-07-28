// change this to be set dynamically by the user
const API_URL = 'https://chartiq-api-8511c706644d.herokuapp.com/api/data'
// Sets the Moving Average Interval to a default of 20, to be changed by the user based on input.
let MOVING_AVERAGE_INTERVAL = document.getElementById("movingAvgInt").defaultValue = 20;
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

    // Increase the resolution of the chart
    const chartWidth = chart.clientWidth * dpr;
    const chartHeight = chart.clientHeight * dpr;

    chart.width = chartWidth;
    chart.height = chartHeight;
    chart.style.width = chartWidth / dpr + 'px';
    chart.style.height = chartHeight / dpr + 'px';

    document.querySelector(".fullChartContainer").style.width = `${chartWidth / dpr + 30}px`
    document.querySelector(".chartXAxis").style.width = `${chartWidth / dpr + 30}px`
    
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
    ctx.clearRect(0, 0, chart.width, chart.height);

    const maxPrice = Math.max(...prices)
    const adjustHeight = maxPrice * .2

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