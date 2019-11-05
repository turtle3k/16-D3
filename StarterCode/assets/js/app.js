// SVG wrapper dimensions are determined by the current width
// and height of the browser window.

// var svgWidth = 1200;
// var svgHeight = 660;
var svgWidth = 960;
var svgHeight = 500;

// var margin = {
//     top: 50,
//     right: 50,
//     bottom: 50,
//     left: 50
// };
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};


var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
// var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
// function yScale(data, chosenYAxis) {
//     // create scales
//     var yLinearScale = d3.scaleLinear()
//         .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
//         d3.max(data, d => d[chosenYAxis]) * 1.2
//         ])
//         .range([height, 0]);
//     return yLinearScale;
// }

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
// function renderYAxes(newYScale, yAxis) {
//     var leftAxis = d3.axisLeft(newYScale);

//     yAxis.transition()
//         .duration(1000)
//         .call(leftAxis);

//     return yAxis;
// }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var label = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        var label = "Age:";
    } else {
        var label = "Income:";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        // .offset([80, -60])
        .offset([-1000, 3000])
        .html(function (d) {
            return (`${d.state}<br>Lacks Healthcare: ${d.healthcare}<br>${label}: ${d[chosenXAxis]}`);
            // return (`${label} ${d[chosenXAxis]}<br>Healthcare: ${d.healthcare}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (data, err) {
    if (err) throw err;

    // parse data  
    // remember + == parseInt() to convert string from csv import to numbers
    data.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // Create y scale function
    // rem first 0 below is padding - i.e. move axis
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.healthcare)])
        .range([height, 0]);
    // var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        // .classed("y-axis", true)
        // .attr("transform", `translate(${width}, 0)`)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        // .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 20)
        .attr("fill", "grey")
        .attr("opacity", ".5");

    // Label the circles
    var circleLables = chartGroup.selectAll(null)
        .data(data)
        .enter()
        .append ("text");

    circleLables
        .attr("x", function (d) {
            //return xLinearScale(d.poverty);
            return xLinearScale(d[chosenXAxis]);
        })
        .attr("y", function (d) {
            return yLinearScale(d.healthcare);
            // return yLinearScale(d[chosenYAxis]);
        })
        .text(function(d) {
            return d.abbr;
        })
        // .attr("text-anchor", "middle")
        // .attr("fill", "white")
        .attr("class", "stateText");

    // Create group for  3 x- axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household income (Median)");

    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");
    // Create group for  3 x- axis labels
    // var ylabelsGroup = chartGroup.append("g")
    //     .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // var povertyLabel = ylabelsGroup.append("text")
    //     .attr("x", 20)
    //     .attr("y", 0)
    //     .attr("value", "healthcare") // value to grab for event listener
    //     .classed("active", true)
    //     .text("Lacks Healthcare (%)");

    // var ageLabel = ylabelsGroup.append("text")
    //     .attr("x", 40)
    //     .attr("y", 0)
    //     .attr("value", "smokes") // value to grab for event listener
    //     .classed("inactive", true)
    //     .text("Smokes %)");

    // var incomeLabel = ylabelsGroup.append("text")
    //     .attr("x", 60)
    //     .attr("y", 0)
    //     .attr("value", "obesity") // value to grab for event listener
    //     .classed("inactive", true)
    //     .text("Obese (%)");



    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXaxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates y axis with transition
                // yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});