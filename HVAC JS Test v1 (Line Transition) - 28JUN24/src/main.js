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
  .attr("transform", `translate(${margin.left},${margin.top})`);

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
  max: 90,
  yLabel: "Average Daily Temperature"
  }}; //end object array: fieldInfo 

//Load and Process Data

let data; //Global variable

document.addEventListener('DOMContentLoaded', (event) => { // Wait for the DOM to be fully loaded

d3.csv("Sample_HVAC.csv").then(function(loadedData) {
    
  data = loadedData; //Assign the loaded data to the global variable

  //Parse the data and convert to numbers

  const parseDate = d3.timeParse("%m/%d/%Y");
  data.forEach((d, i) => {
    d.date = parseDate(d.date);
    d.kWh = +d.kWh;
    d.DailyTempF = +d.DailyTempF;
    if(d.DailyTempF  > fieldInfo.temp.max
      || d.DailyTempF < fieldInfo.temp.min
      || (d.DailyTempF - data[i - 1].DailyTempF) > 20
      || (d.DailyTempF - data[i - 1].DailyTempF) < -20) {
      d.DailyTempF = "NaN"; //flag out-of-range temperatures
    } //end if: temperature data check
  }); //end function: y data parse/conversions
  
  // Impute missing temperature data

  data.forEach((d, i) => {
  if (i > 0) { // Ensure there is a previous element to compare with
      // If it's the last element or there's no next day's data, keep the current value unchanged
      if (i === data.length - 1
        || isNaN(data[i + 1].DailyTempF)
        || isNaN(data[i - 1].DailyTempF)) {
        d.DailyTempF = +d.DailyTempF; 
      } else if (isNaN(d.DailyTempF)){
          d.DailyTempF = (+data[i + 1].DailyTempF + +data[i - 1].DailyTempF) / 2;
      }}
    d.DailyTempF = +d.DailyTempF; //convert new "NaN" values to numbers
    }) //end if: temperature range check
      
console.log(data);

  //Add the x-axis

  xScale.domain(d3.extent(data, (d) => d.date), 0);  //Set the x domain based on date range 

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
    .data(xScale.ticks().slice(1))  //slice(1) removes the first tick
    .join("line")
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

    //Create a blank y-axis with no ticks or labels

    svg.append("g")
      .attr("class", "y axis")
      .attr("id", "yAxis")
      .call(d3.axisLeft(yScale)
        .tickFormat(0)
        .tickSize(0)
        .tickPadding(10))
      .call((g) => g.select(".domain").remove())
      .attr("opacity", 0)
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .selectAll(".tick text")
        .style("fill", "#777")
        .style("visibility", (d, i, nodes) => {
          if (i === 0) {
            return "hidden";
          } else {
            return "visible";
          }
        });

    //Add y-axis label (initially blank)

    svg.append("text")
      .attr("opacity", 0)
      .attr("id", "yTitle")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#777")
      .style("font-family", "sans-serif")
      .text("");

    //Define the initial line function

    let line = d3.line()
      .x((d) => xScale(d.date))  //calling the x scale function
      .y(height);  //starting at zero for initial transition purposes

    //Append a path element to the SVG
      
    svg.append("path") //append the path element
      .data([data]) //bind the data to the path element
      .attr("id", "pathGen") //assign an id to the path element
      .attr("fill", "none") 
      .attr("stroke", "steelblue")
      .attr("opacity", 0.2)  
      .attr("d", line); //call the line function  

}); //end function: d3.csv load

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
    let xSitionT = 1250; //transition time in milliseconds

//Reformat the y-axis

yScale.domain([0, d3.max(data, (d) => d[fieldName])]);  //Reset the y domain based on the selected field

svg.select(".y.axis")
    .call(d3.axisLeft(yScale)
      .tickFormat(formatter)
      .tickSize(0)
      .tickPadding(10))
    .call((g) => g.select(".domain").remove())
    .attr("opacity", 0)
    .transition()
      .duration(xSitionT)
    .attr("opacity", 1);

//UpdateAdd y-axis label

svg.select("#yTitle")
    .attr("opacity", 0)
    .transition()
      .duration(xSitionT)
    .attr("opacity", 1)
    .text(yLabel);

  //Add horizontal gridlines

  svg.selectAll(".yGrid")
      .data(yScale.ticks((d3.max(data, (d) => d.kWh) - 0) / 1000).slice(1))
      .join("line")
      .transition()
      .duration(xSitionT)
      .attr("class", "yGrid")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5);

  // Redefine the yScale, and transition it to the new data y data
  
  line = d3.line()
    .defined(d => { return(!isNaN(d[fieldName])
      && (d[fieldName] > min)
      && (d[fieldName] < max) 
    )})  //defined method elimanated need for filteredArray
    .x((d) => xScale(d.date))  //calling the x scale function
    .y((d) => yScale(d[fieldName]));  //calling the y scale function

  svg.selectAll("#pathGen")
    .attr("opacity", 0)
    .data([data]) //bind the data to the path element
    .transition()
      .duration(xSitionT/2)
    .attr("opacity", 1)
    .attr("stroke", "steelblue")
    .attr("d", line)
    .call((g) => g.select(".domain").remove());

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