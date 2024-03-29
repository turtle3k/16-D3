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
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
        d3.max(data, d => d[chosenXAxis]) * 1.1
        ])
        .range([0, width]);
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.85,
        d3.max(data, d => d[chosenYAxis]) * 1.15
        ])
        .range([height, 0]);
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
// function renderCircles(circlesGroup, newXScale, chosenXAxis) {
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        // .attr("cy", d => yLinearScale(d.healthcare));
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}
// Label the circles
// function renderText(textGroup, newXScale, chosenXAxis) {
function renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis) {
    // var circleLables = chartGroup.selectAll(null)
    textGroup.transition()
        .duration(1000)
        .attr("x", function (d) {
            //return xLinearScale(d.poverty);
            return xLinearScale(d[chosenXAxis]);
        })
        .attr("y", function (d) {
            // return yLinearScale(d.healthcare);
            return yLinearScale(d[chosenYAxis]);
        })
    return textGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    // function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    // set x label
    if (chosenXAxis === "poverty") {
        var label = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        var label = "Age:";
    } else {
        var label = "Income:";
    }
    //if block for the 3 Y Axis goes here (if i get to it)
    // healthcare, smokes, obesity
    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
        var ylabel = "Smokes:";
    } else {
        var ylabel = "Obesity:";
    }

    // create tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        // .offset([-1000, 3000])
        .html(function (d) {
            // return (`${d.state}<br>Lacks Healthcare: ${d.healthcare}<br>${label} ${d[chosenXAxis]}`);
            return (`${d.state}<br>${ylabel} ${d[chosenYAxis]}<br>${label} ${d[chosenXAxis]}`);
            // return (`${label} ${d[chosenXAxis]}<br>Healthcare: ${d.healthcare}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
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
    var yLinearScale = yScale(data, chosenYAxis);

    // Create y scale function
    // rem first 0 below is padding - i.e. move axis
    // var yLinearScale = d3.scaleLinear()
    //     .domain([0, d3.max(data, d => d.healthcare)])
    //     .range([height, 0]);
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
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        // // .attr("transform", `translate(${width}, 0)`)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        // .attr("cy", d => yLinearScale(d.healthcare))
        .classed("stateCircle", true)
        .attr("r", 15)
        .attr("fill", "grey")
        .attr("opacity", ".5");


    // append initial text
    var textGroup = chartGroup.selectAll(".stateText")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        // .attr("y", d => yLinearScale(d.healthcare))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .classed("stateText", true)
        .text(function (d) {
            return d.abbr
        });

    // Create group for  3 x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("aText", true)
        .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Household income (Median)");

    // Create group for  3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left / 4}, ${(height / 2)})`);

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", 0 - 20)
        // .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .classed("aText", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", 0 - 40)
        // .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", 0 - 60)
        // .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Obese (%)");

    // });

    // append y axis
    // chartGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left)
    //     .attr("x", 0 - (height / 2))
    //     .attr("dy", "1em")
    //     .classed("axis-text", true)
    //     .text("Lacks Healthcare (%)");


    // updateToolTip function above csv import
    // var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

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
                // circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // update circles w/ labels
                // textGroup = renderText(textGroup, xLinearScale, chosenXAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

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

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYaxis with value
                chosenYAxis = value;

                // console.log(chosenYAxis)

                // updates x scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                // circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // update circles w/ labels
                // textGroup = renderText(textGroup, xLinearScale, chosenXAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

        // .catch(function (error) {
        //     console.log(error);
        // });
});