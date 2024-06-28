//Define chart dimensions and margin constants

const margin = { top: 70, right: 30, bottom: 40, left: 80 };
const width = 1200 - margin.left - margin.right; 
const height = 500 - margin.top - margin.bottom;

//Define x and y scales

const xScale = d3.scaleTime().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

//Create the SVG element and append it to the html chart container div

const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(${margin.left},${margin.top})");

//Load and Process Data

document.addEventListener('DOMContentLoaded', (event) => { // Wait for the DOM to be fully loaded

let data; //Global variable

d3.csv("Sample_HVAC.csv").then(function(loadedData) {
  
  data = loadedData; //once loaded, copy data to loadedData
  
  console.log(data);

  //Parse the data and convert to numbers

  const parseDate = d3.timeParse("%m/%d/%Y");
  data.forEach((d) => {
    d.date = parseDate(d.date);
    d.kWh = +d.kWh;
    d.DailyTempF = +d.DailyTempF;
  }); //end function: y data parse/conversions

  //Add the x-axis

  xScale.domain(d3.extent(data, (d) => d.date), 0);  //Set the x domain based on date range

  d3.selectAll(".axisBottom").remove();  // Remove the existing data from the chart

  svg.append("g")
    .call(d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(6))
        .tickFormat(d3.timeFormat("%b %Y")))
    .call((g) => g.select(".domain").remove())
    .attr("id", "axisBottom")
    .attr("class", "axes")
    .attr("transform", `translate(0, ${height})`)
    .style("font-size", "14px")
    .selectAll(".tick line")
      .style("stroke-opacity", 0.1)
    .selectAll(".tick text")
      .attr("fill", "#777");

  //Add vertical gridlines

  svg.selectAll("xGrid")
    .remove()
    .data(xScale.ticks().slice(1))
    .join("line")
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

}); //end function: d3.csv load

//create nested array object for chart variable selections to pass into functions

let fieldInfo = {
energyUsage: {
fieldName: "kWh",
formatter: (d) => {
   return `${(d/1000).toFixed(0)} MW`;},
min: Number.MIN_VALUE,
max: Number.MAX_VALUE,
yLabel: "Daily Electrical Energy"
},
temp: {
fieldName: "DailyTempF",
formatter: (d) => {
   return `${(d).toFixed(0)}F`;},
min: 1,
max: 94,
yLabel: "Average Daily Temperature"
}}; //end object array: fieldInfo 

//retrieve html drop-down selection on change

let selection = document.querySelector('#selectField')

selection.addEventListener('change', () => {

    let fieldKey = selection.value; // Define fieldKey as the selected value

    //console log to verify proper retrieval

    displayLine(fieldKey); // Call the displayLine function with the selected value

  }); //end event listener: drop-down selection
  
//Define the displayLine function to help with transitions using fieldKey selection

function displayLine(fieldKey) {

    let { fieldName, formatter, min, max, yLabel } = fieldInfo[fieldKey];
    let xSitionT = 2500; //transition time in milliseconds

    yScale.domain([0, d3.max(data, (d) => d[fieldName])]);  //Set the y domain based on the selected field

//Add and format the y-axis

    d3.select(".axisLeft").remove();  // Remove any existing y-axis

    svg.append("g")
      .attr("class", "axisLeft removeOnUpdate")
      .style("font-size", "14px")
      .call(d3.axisLeft(yScale).tickFormat(formatter).tickSize(0).tickPadding(10))
      .call((g) => g.select(".domain").remove())
      .selectAll(".tick text")
      .style("fill", "#777")
      .style("visibility", (d, i, nodes) => {
        if (i === 0) {
          return "hidden";
        } else {
          return "visible";
        }
      });

//Add y-axis label

d3.select(".yTitle").remove();  // Remove any existing y-axis label

svg
  .append("text")
  .attr("opacity", 0.5)
  .attr("class", "yTitle")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - height / 2)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("font-size", "14px")
  .style("fill", "#777")
  .style("font-family", "sans-serif")
  .text(yLabel);

  svg.append("g")
    .attr("class", "axisRight")
    yAxis = svg.append("g");

    yAxis.transition()
      .duration(xSitionT)
      .delay(xSitionT/2)
    .attr("id", "yAxis")
    .attr("opacity", 1);

  //Add horizontal gridlines

  svg.selectAll(".yGrid")
      .data(yScale.ticks((d3.max(data, (d) => d.kWh) - 0) / 1000).slice(1))
      .join("line")
      .transition()
      .duration(xSitionT/2)
      .attr("class", "yGrid")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5);

//Define a Path referencing data-driven axis output ranges

let line = d3.line()
  .defined(d => { return(!isNaN(d[fieldName])
    && (d[fieldName] > min)
    && (d[fieldName] < max))})  //'defined' method eliminated need for filteredArray
  .x((d) => xScale(d.date))  //calling the x scale function
  .y((d) => yScale(+d[fieldName]));  //calling the y scale function

//Use "Join" to update the chart SVG with the new path 

  svg.selectAll("path#myLineChart")
    .data([data])
    .join("path")
    .attr('id', 'myLineChart')
    .attr("fill", "none")
    .attr("stroke", "steelblue");

  // Select the line, if it exists, and transition it to the new data
  
  let lineChart = svg.select('#myLineChart')
    .datum(data)
    .transition()
    .duration(xSitionT)
    .attr("d", line(data));

} //End of displayLine function

}); //end event listener: DOMContentLoaded

//Add additional chart details

  //Add chart title
  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin.left - 115)
    .attr("y", margin.top - 100)
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .text("Example Building Energy Trend");

  //Add source credit
  svg.append("text")
    .attr("class", "source-credit")
    .attr("x", width - 1125)
    .attr("y", height + margin.bottom - 3)
    .style("font-size", "9px")
    .style("font-family", "sans-serif")
    .text("Source: Anonymized Army Data");