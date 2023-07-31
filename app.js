// Link to the API. This is where we receive data
const API_URL = 'https://chartiq-api-8511c706644d.herokuapp.com/api/data';

// Defaults the moving average interval to 20 days, to be changed by user input.
let movingAverageInterval = document.getElementById("movAvgIntInput").defaultValue = 20;

// This will store our cleaned data outside of the API call function
let stockPriceData;

// API call
async function fetchStockData() {
    try {

        // fetches API data dynamically and returns a Promise.
        const response = await fetch(API_URL);

        // converts to JSON after the Promise is resolved.
        const data = await response.json();

        // isolates the OHLCC data from the JSON with the 'Time Series (Daily)' key.
        const stockData = data[1]['Time Series (Daily)'];

        // Object.entries() returns an array of arrays which contain two elements each, derived from the data object's key value pairs.
        // Here, .map([date, values]) returns an array of objects with the date and value assigned to the following format: { 'date': XX/XX/XXXX, 'price': XXX.XXXXXX}
        const stockPrices = Object.entries(stockData).map(([date, values]) => {
            return { date, price: parseFloat(values['Close']) };
        })

        // This variable assignment allows our data to be accessed from outside of this function
        stockPriceData = stockPrices;

        // Passes our cleaned data in a call to the drawChart function
        drawChart(stockPrices);

    } catch (error) {
        console.error('error fetching stock data:', error);
    }
}

// handles user input and the reassignment of the movingAverageInterval variable
function handleMovingAvgIntUpdate(stockPriceData) {

    // selects the HTML element that takes user input
    const inputString = document.getElementById('movAvgIntInput');

    // converts input from a string to a number
    const inputNum = parseInt(inputString.value);

    // assigns converted input to the movingAverageInterval variable
    movingAverageInterval = inputNum;

    // redraws the chart with the new 
    drawChart(stockPriceData);
}

function drawChart(data) {

    // Ratio between the device's physical pixel resolution to the CSS pixel resolution
    const dpr = window.devicePixelRatio || 1;
    
    // selects the HTML Canvas element
    const chart = document.getElementById("lineChart");

    // establishes a context to render 2D drawings
    const ctx = chart.getContext("2d");

    // Increase the resolution of the chart. clientWidth/Height gets the inner pixel dimensions of the canvas element
    const chartWidth = chart.clientWidth * dpr;
    const chartHeight = chart.clientHeight * dpr;
    chart.width = chartWidth;
    chart.height = chartHeight;
    
    // Sets a backup height at width based on the dpr, which helps with the responsive design.
    chart.style.width = `${chartWidth / dpr}px`;
    chart.style.height = `${chartHeight / dpr}px`;

    // Scales the context's pixel ratio based on the dpr. For example, if the dpr is 2, then each pixel in a drawing will be scaled to take up 2 pixels.
    ctx.scale(dpr, dpr);
    
    // Creates a separate array of closing price data.
    const prices = data.map(entry => entry.price);

    // An array of dates for our X-axis labels
    const months = ['', '08/22', '09/22', '10/22', '11/22', '12/22', '01/23', '02/23', '03/23', '04/23', '05/23', '06/23', '07/23', ''];

    // These variables are used to create dynamic Y-axis labels, based on our data's stock prices.
    let yAxisUpperBound = 0;
    let yAxisLowerBound = Infinity;
    let yAxisLabelArr = [];

    // Loop through the prices and finds and assigns the upper and lower bounds. Rounds to a whole number
    for (let i = 0; i < prices.length; i++) {
        if (prices[i] > yAxisUpperBound) {
            yAxisUpperBound = Math.round(prices[i] / 10) * 10;
        }
        if (prices[i] < yAxisLowerBound && prices[i] > 0) {
            yAxisLowerBound = Math.round(prices[i] / 10) * 10;
        }
    }

    // Determines the interval between Y-axis labels. Could be refactored to be more dynamic.
    let yAxisInterval = Math.round((yAxisUpperBound - yAxisLowerBound) / 4);

    // Generates and pushes Y-axis labels to the yAxisLabelArr. The loop's condition statement could be refactored to be more dynamic.
    for (let i = 0; i < 5; i++) {
        yAxisLabelArr.push(yAxisLowerBound + (i * yAxisInterval));
    }

    // Adds a blank space to the first position in array for formatting.
    yAxisLabelArr.unshift('');

    // Calculates the moving average based on movingAverageInterval variable
    const movingAverages = [];

    // Loops through the prices arr and creates subarrays based on the moving average interval. These subarrays are summed, divided by the MAI, and then pushed to a new array of MAI's.
    for (let i = movingAverageInterval - 1; i < prices.length; i++) {
        const sum = prices.slice(i - movingAverageInterval + 1, i + 1).reduce((acc, val) => acc + val, 0);

        movingAverages.push(sum / movingAverageInterval);
    }

    // Clear the canvas
    ctx.clearRect(0, 0, chartWidth, chartHeight);

    // Create breakout variables for cleaner formulas below. Both variables aid in height adjustment for the chart being drawn. -1.55 should likely be linked to the dpr var up above to be more dynamic.
    const maxPrice = Math.max(...prices);
    const adjustHeight = maxPrice * -1.55;

    // grid preference variables
    const gridQuadrantSize = 57.1;

    // determines the distance from the default chart origin that the X and Y axes are drawn
    const xAxisDistanceGridLines = 6;
    const yAxisDistanceGridLines = 1;

    
    const linesX = Math.floor(chartHeight / gridQuadrantSize);
    const linesY = Math.floor(chartWidth / gridQuadrantSize);

    // Draw X axis grid lines
    for (let i = 0; i < linesX; i++) {
        ctx.beginPath();
        ctx.lineWidth = 1;

        if (i == xAxisDistanceGridLines) {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = "#c7c7c7";
        }

        if (i == linesX) {
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

        if (i == yAxisDistanceGridLines) {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = "#c7c7c7";
        }

        if (i == linesY) {
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
    ctx.translate(gridQuadrantSize, 342.6);

    // Ticks marks along the positive X-axis
    for (i = 0; i < linesY; i++) {

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";

        // Draw a tick mark 6px long (-3 to 3)
        ctx.moveTo(gridQuadrantSize * i + 0.5, -4);
        ctx.lineTo(gridQuadrantSize * i + 0.5, 4);
        ctx.stroke();

        // Text value at that point
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(months[i], gridQuadrantSize * i - 2, 14);
    }

    // Ticks marks along the positive Y-axis
    for (i = 0; i < linesX; i++) {

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";

        // Draw a tick mark 6px long (-3 to 3)
        ctx.moveTo(-4, -gridQuadrantSize * i + 0.5);
        ctx.lineTo(4, -gridQuadrantSize * i + 0.5);
        ctx.stroke();

        // Text value at that point
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        yAxisLabelArr[i] === '' ? 
            ctx.fillText(yAxisLabelArr[i], -16, -gridQuadrantSize * i - 2) :
            ctx.fillText(`$${yAxisLabelArr[i]}`, -16, -gridQuadrantSize * i - 2);
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
document.getElementById("submitButton").addEventListener("click", () => handleMovingAvgIntUpdate(stockPriceData));

fetchStockData();