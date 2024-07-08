
//Set dimensions and margins for the chart

const margin = { top: 70, right: 30, bottom: 40, left: 80};
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

//Set up the x and y scales

const x =d3.scaleLinear()
    .range([0, width]);

const y =d3.scaleLinear()
    .range([height, 0]);

//Create the SVG element and append it to the chart container

const svg = d3.select("#chart-container")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

//Load and Process Data

let data;

function cleanData(data) {
    const parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(d => {
        d.date = parseDate(d.date);
        d.DailyTempF = +d.DailyTempF;
        d.kWh = +d.kWh;
    });
    return data;

} //end cleanData function
    
console.log(data);

function initializeChart(data) {

data = cleanData(data);

//Define the x and y axis

x.domain(d3.extent(data, d => d.DailyTempF));
y.domain([0, d3.max(data, d => d.kWh)]);

//Add the x-axis

svg.append("g")
    .attr("transform", `translate(0, ${height-10})`)
    .style("font-size", "14px")
    .call(d3.axisBottom(x)
        .ticks((d3.max(data, d => d.DailyTempF) - 0) / 10))
    .call(g => g.select(".domain").remove())
    .selectAll(".tick line")
    .style("stroke-opacity", 0)
svg.selectAll(".tick text")
    .attr("fill", "#777");

//Add the y-axis

svg.append("g")

    .style("font-size", "14px")
    .call(d3.axisLeft(y)
        .ticks((d3.max(data, d => d.kWh) - 0) / 1000)
        .tickFormat(d => {
            return `${(d / 1000).toFixed(0)} MWh`;
        }) 
        .tickSize(0)
        .tickPadding(10))
    .call(g => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", (d, i, nodes) => {
        if (i === 0) {
            return "hidden";
        } else {
            return "visible";
        }
    });

//Add vertical gridlines

svg.selectAll("xGrid")
.data(x.ticks().slice(1))
.join("line")
.attr("x1", d => x(d))
.attr("x2", d => x(d))
.attr("y1", 0)
.attr("y2", height-5)
.attr("stroke", "#e0e0e0")
.attr("stroke-width", .5);

//Add horizontal gridlines
svg.selectAll("yGrid")
.data(y.ticks((d3.max(data, d => d.kWh) - 0) / 1000).slice(1))
.join("line")
.attr("x1", 0)
.attr("x2", width)
.attr("y1", d => y(d))
.attr("y2", d => y(d))
.attr("stroke", "#e0e0e0")
.attr("stroke-width", .5);

//Add x-axis label
svg.append("text")
    .attr("x", width/2)
    .attr("y", height + margin.bottom - 3)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#777")
    .style("font-family", "sans-serif")
    .text("Daily Outdoor Temp (F)");

//Add y-axis label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#777")
    .style("font-family", "sans-serif")
    .text("Daily Electrical Energy");

//Add data points to the chart

svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.DailyTempF); } )
    .attr("cy", function (d) { return y(d.kWh); } )
    .attr("r", 3)
    .classed("highTemp", (d) => (d.DailyTempF > 80))
    // .classed('data-points', true)
    ;

//Add chart title
svg.append("text")
.attr("class", "chart-title")
.attr("x", margin.left -115)
.attr("y", margin.top - 100)
.style("font-size", "24px")
.style("font-weight", "bold")
.style("font-family", "sans-serif")
.text("Example Building Data Correlation");

//Add source credit

svg.append("text")
    .attr("class", "source-credit")
    .attr("x", 0)
    .attr("y", height + margin.bottom -3)
    .style("font-size", "9px")
    .style("font-family", "sans-serif")
    .text("Source: Anonymized Army Data");

} //end initializeChart function

//Create update function with variables to hold selected values from the drop-down menu

let dataByYear;

function updateChart(data, selectionYear) {

//Call function to display points based on year selected

 function filterByYear(data, selectionYear) {
    return data.filter(d => d.year === +selectionYear);
    };

let selection = document.querySelector('#selectYear');

dataByYear = filterByYear(data, selection.value);
    
let circles = svg.selectAll("circle")
    .data(dataByYear)
    .classed("highTemp", (d) => (d.DailyTempF > 80));

circles.enter()
    .append("circle")
    .attr("r", 3) // Assuming a radius of 3 for new circles
    // Initial attributes for new elements (if needed)
    .merge(circles) // Merge enter and update selections
    .transition()
    .duration(1000)
    .attr("cx", d => x(d.DailyTempF))
    .attr("cy", d => y(d.kWh));

// Exit selection: Remove circles that no longer match the data
circles.exit().remove();

} //end updateChart function

document.addEventListener('DOMContentLoaded', loadingData);

//retrieve html drop-down selection on change

function loadingData() {   
    d3.csv("Sample_HVAC.csv").then(data => initializeChart(data));
let selection = document.querySelector('#selectYear');
console.log(selection.value);
selection.addEventListener('change', (event) => {updateChart(data, selection.value)});
} //end loadingData function
