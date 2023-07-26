// declare variables for the API call
const API_KEY = 'K0HTOOWI401WQMWH';
const SYMBOL = 'IBM';
const MOVING_AVERAGE_INTERVAL = 20;
const URL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${SYMBOL}&apikey=${API_KEY}`;

// select the chart element and its rendering context to enable drawn content
const chart = document.getElementById("chart")
const ctx = chart.getContext("2d")

// API call
async function fetchStockData() {
    try {
        // fetches API data dynamically
        const response = await fetch(URL);
        // converts to JSON after 
        const data = await response.json();
        const stockData = data['Time Series (Daily)']

        function stockPrices([date, value]) {
            
        }
    }
}