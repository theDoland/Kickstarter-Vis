var scatterData,
    scatterWidth = 800,
    scatterHeight = 300,
    scatterScaleX,
    scatterScaleY,
    currentCategory
    scatterCheckedYears = ["2014", "2015", "2016", "2017"];

// consider removing bad data
function ScatterChart(container, data, selection) {
    //console.log("in scatter plots"); 
    //console.log(data);
    scatterData = data;
    // margins and dimensions for the graph
    var margin = {
            top: 50,
            right: 10,
            bottom: 100,
            left: 150
        },
        width = 800,
        height = 300;

    var xScale = d3.scaleTime()
        .domain(d3.extent(data, function (d) {
            return (d["launched2"]);
        }))
        .range([0, width]),
        xAxis = d3.axisBottom(xScale);

    // y axis
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d["usd_pledged"];
        })])
        .range([height, 0]),
        yAxis = d3.axisLeft(yScale);
    scatterScaleX = xScale;
    scatterScaleY = yScale;


    // add graph canvas to body
    var svg = d3.select(".scatter")
        .append("svg")
        .attr("class", "scatterPlot")
        .attr("width", width + margin.left + margin.right + 100)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "circleholder");

    var scatter = svg.append("g")
        .attr("id", "scatterplot")
        .attr("clip-path", "url(#clip)");

    // allow for brushing and zooming --> credit to https://bl.ocks.org/EfratVil/d956f19f2e56a05c31fb6583beccfda7
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    // append the x and y axis
    svg.append("g")
        .attr('id', "axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var xAxisText = height + 40;
    svg.append("text")
        .attr("transform", "translate(" + width / 2 + "," + xAxisText + ")")
        .style("text-anchor", "middle")
        .text("Date");

    svg.append("g")
        .attr('id', "axis--y")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "translate(-150," + height / 2 + ")")
        .text("USD Pledged");

    // draw the dots
    var circles = scatter.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", function (d) {
            var num = d["data_diff_days"];
            return num / 4;
        })
        .style("opacity", function (d) {
            return (d["data_diff_days"] / 155).toFixed(2);
        })
        .attr("cx", function (d) {
            return xScale(d["launched2"])
        })
        .attr("cy", function (d) {
            return yScale(d["usd_pledged"])
        })
        .style("fill", function (d) {
            if (d["state"] == "failed")
                return "#C2151B";
            else if (d["state"] == "successful")
                return "#29cf6c"
        })
        .attr("class", function (d) {
            if (d["state"] == "failed")
                return "Red " + "a" + d["launched"].getFullYear() + " isEnabled";
            else if (d["state"] == "successful")
                return "Green " + "a" + d["launched"].getFullYear() + " isEnabled";
        })
        .attr("id", function (d) {
            return d["main_category"];
        });
    // add brush credit to: https://bl.ocks.org/EfratVil/d956f19f2e56a05c31fb6583beccfda7
    var brush = d3.brush().extent([
            [0, 0],
            [width, height]
        ])
        .on("brush", function (d) {
            if (d3.event.selection != null) {

                // revert circles to initial style
                circles.attr("class", function(d){
                    return "non_brushed " + "a" + d["launched"].getFullYear();
                })
                .attr("id", function (d) {
                    return d["main_category"];
                });

                var brush_coords = d3.brushSelection(this);

                // style brushed circles
                circles.filter(function () {

                        var cx = d3.select(this).attr("cx"),
                            cy = d3.select(this).attr("cy");

                        return isBrushed(brush_coords, cx, cy);
                    })
                    .attr("class", function(d){
                        return "brushed " + "a" + d["launched"].getFullYear();
                    })
                    .attr("id", function (d) {
                        return d["main_category"];
                    });
            }
        })
        .on("end", brushended),
        idleTimeout,
        idleDelay = 350;

    // allow for brushing and zooming --> credit to https://bl.ocks.org/EfratVil/d956f19f2e56a05c31fb6583beccfda7
    scatter.append("g")
        .attr("class", "brush")
        .call(brush);
    // create the legend
    var moveRect = 3;
    var legend = d3.select("body").select(".scatterPlot").append("g")
        .selectAll("g")
        .data(["#C2151B", "#29cf6c"])
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            var rectheight = 18;
            var x = 0;
            var y = i * rectheight + moveRect + 50;
            moveRect += 3;
            return "translate(" + x + ',' + y + ')';
        });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d) {
            return d;
        })
        .attr("value", function (d) {
            if (d == "#C2151B")
                return "Failure";
            else if (d == "#29cf6c")
                return "Success";
        })
        .on("click", function (stateType) {
            if (stateType == "#29cf6c") {
                // get only successful kickstarters
                d3.select("body")
                    .select(".scatterPlot")
                    .select("#circleholder")
                    .select("#scatterplot")
                    .selectAll(".Red")
                    .data(data, function (d) {
                        return d["state"] != "failed"
                    })
                    .exit()
                    .remove();
                // get the last dot
                d3.select("body")
                    .select(".Red")
                    .remove();
            } else if (stateType == "#C2151B") {
                // get only failed kickstarters
                d3.select("body")
                    .selectAll(".Green")
                    .data(data, function (d) {
                        return d["state"] != "successful"
                    })
                    .exit()
                    .remove();

                // get the last dot
                d3.select("body")
                    .select(".Green")
                    .remove();
            }
        });

    legend.append("text")
        .attr("x", 22)
        .attr("y", 15)
        .text(function (d) {
            if (d == "#C2151B")
                return "Failure";
            else if (d == "#29cf6c")
                return "Success";
        });

    function isBrushed(brush_coords, cx, cy) {

        var x0 = brush_coords[0][0],
            x1 = brush_coords[1][0],
            y0 = brush_coords[0][1],
            y1 = brush_coords[1][1];

        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
    }

    function selectCircles() {
       
    }
    // allow for brushing and zooming --> credit to https://bl.ocks.org/EfratVil/d956f19f2e56a05c31fb6583beccfda7
    function brushended() {

        selectCircles();



        var s = d3.event.selection;
        if (!s) {
            //console.log("test brush if")
            if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
            xScale.domain(d3.extent(data, function (d) {
                return d["launched2"];
            })).nice();
            
            yScale.domain(d3.extent(data, function (d) {
                return d["usd_pledged"];
            })).nice();
            //console.log("test brush if if")
            // reset the scatterplot
            d3.select("body")
            .select(".scatterPlot")
            .select("#circleholder")
            .select("#scatterplot")
            .selectAll("circle")
            .style("opacity", function(d){
                    return (d["data_diff_days"] / 155).toFixed(2);
            });
            // reset checked years
            // scatterCheckedYears = ["2014", "2015", "2016", "2017"];
            scatterCheckedYears = [ "2015", "2016", "2017"];

            currentCategory = null;
            ctx.clearRect(0,0,width,height);
            Interaction_Selected_Data = originalData;
            render(Interaction_Selected_Data);

            // reset the checkboxes to be checked
            //document.getElementById("check2014").checked = true;
            document.getElementById("check2015").checked = true;
            document.getElementById("check2016").checked = true;
            document.getElementById("check2017").checked = true;

            d3.select(".radarChart").selectAll('*').remove();
    		makeRadar(scatterCheckedYears);
            
        } else {
            //console.log("test brush else")
            xScale.domain([s[0][0], s[1][0]].map(xScale.invert, xScale));
            yScale.domain([s[1][1], s[0][1]].map(yScale.invert, yScale));
            scatter.select(".brush").call(brush.move, null);
            
            var d_brushed = d3.selectAll(".brushed").data();

            var newdata = d_brushed.filter(function(d){
                console.log(scatterCheckedYears);
                // no category selected
                if(!currentCategory){
                    return (scatterCheckedYears.indexOf(String(d["launched"].getFullYear())) > -1);
                }
                // otherwise isolate the currently checked years and the current category
                return (d["main_category"] == currentCategory && scatterCheckedYears.indexOf(String(d["launched"].getFullYear())) > -1);
            })
            // ESSENTIALLY FIGURE OUT A WAY TO FILTER THE DATA TO SEE ONLY THE YEAR'S DATA
            console.log(newdata);
            ctx.clearRect(0,0,width,height);
            render(newdata);
        }
        zoom();

    }

    function idled() {
        idleTimeout = null;
    }

    function zoom() {
        var t = scatter.transition().duration(750);
        svg.select("#axis--x").transition(t).call(xAxis);
        svg.select("#axis--y").transition(t).call(yAxis);
        scatter.selectAll("circle").transition(t)
            .attr("cx", function (d) {
                return xScale(d["launched2"]);
            })
            .attr("cy", function (d) {
                return yScale(d["usd_pledged"]);
            });
    }
}

function scatterUpdate(checkedYears, uncheckedYears) {

    scatterCheckedYears = checkedYears;
    // update the checked years
    checkedYears.forEach(element => {
        var selector = ".a" + element;
        d3.select("body")
            .select(".scatterPlot")
            .select("#circleholder")
            .select("#scatterplot")
            .selectAll(selector)
            .style("opacity", function (d) {
                return (d["data_diff_days"] / 155).toFixed(2);
            });
    });

    // update the nonchecked years
    uncheckedYears.forEach(element => {
        var selector = ".a" + element;
        d3.select("body")
            .select(".scatterPlot")
            .select("#circleholder")
            .select("#scatterplot")
            .selectAll(selector)
            .style("opacity", 0);
    });
}

function changeCategory(category) {
    var categories = ["#Art", "#Comics", "#Crafts", "#Design", "#Fashion", "#FilmVideo", "#Food",
        "#Games", "#Journalism", "#Music", "#Photography", "#Publishing", "#Technology", "#Theater"
    ];
    // filter category based on the years chosen
  if(currentCategory != category){
    categories.forEach(d => {
        // find the currently selected category and disable it
        d3.select("body")
            .select(".scatterPlot")
            .select("#circleholder")
            .select("#scatterplot")
            .selectAll(d)
            .style("opacity", function(d){
                if(d["main_category"] == category)
                    return (d["data_diff_days"] / 155).toFixed(2);
                else
                    return 0;  
            });
    })
    currentCategory = category;
  }
  else{
        categories.forEach(d => {
        // find the currently selected category and disable it
        d3.select("body")
            .select(".scatterPlot")
            .select("#circleholder")
            .select("#scatterplot")
            .selectAll(d)
            .style("opacity", function(d){
                return (d["data_diff_days"] / 155).toFixed(2); 
            });
    })
    currentCategory = null;
  }
}
