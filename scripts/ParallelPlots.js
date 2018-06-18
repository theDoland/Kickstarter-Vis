
// based on https://bl.ocks.org/syntagmatic/05a5b0897a48890133beb59c815bd953
var render;
var Interaction_Selected_Data;
var ctx;
var margin = {top: 66, right: 110, bottom: 80, left: 65},
      width = 1000 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom,
      innerHeight = height - 2;

function ParallelPlots(container, data, selection) {

  Interaction_Selected_Data = data;
  

  var devicePixelRatio = window.devicePixelRatio || 1;

  var color = d3.scaleOrdinal()
    .range(["#fdb462","#b3de69","#fb8072","#da894d","#fccde5","#80b1d3","#bc80bd","#bebada","#ccebc5","#8dd3c7","#725D82"]);
  function getColor(c) {
    switch (c) {
      case "failed":
        return '#C2151B';
        break;
      case "canceled":
        return '#F3A002';
        break;
      case "successful":
        return '#29cf6c';
        break;
      case "live":
        return '#176c91';
        break;
      default:
        return '#2021A0';
        break;
    }
  }

  var types = {
    "Number": {
      key: "Number",
      coerce: function(d) { return +d; },
      extent: d3.extent,
      within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
      defaultScale: d3.scaleLinear().range([innerHeight, 0])
    },
    "String": {
      key: "String",
      coerce: String,
      extent: function (data) { return data.sort(); },
      within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
      defaultScale: d3.scalePoint().range([0, innerHeight])
    },
    "Date": {
      key: "Date",
      coerce: function(d) { return new Date(d); },
      extent: d3.extent,
      within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
      defaultScale: d3.scaleTime().range([0, innerHeight])
    }
  };


  var dimensions = [
    {
    key: "main_category",
    description: "Category",
    type: types["String"]
    },
    {
    key: "goal",
    description: "Goal",
    type: types["Number"],
    //scale: d3.scaleLog().range([innerHeight, 0])
    },
    {
    key: "usd_pledged",
    description: "USD Pledged",
    type: types["Number"],
    //scale: d3.scaleLog().range([innerHeight, 0])
    },
    {
    key: "backers",
    description: "Backers",
    type: types["Number"],
    //scale: d3.scaleLog().range([innerHeight, 0])
    },
   {
    key: "data_diff_days",
    type: types["Number"],
    description: "Number of Days Up",
    }, 
    {
    key: "state",
    description: "Result of Kick Starter",
    type: types["String"]
    }
  ];

  var xscale = d3.scalePoint()
      .domain(d3.range(dimensions.length))
      .range([0, width]);

  var yAxis = d3.axisLeft();

  var container = d3.select(".parallelcoordinates").append("div")
      .attr("class", "parcoords")
      .style("width", width + margin.left + margin.right + "px")
      .style("height", height + margin.top + margin.bottom + "px");

  var svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var canvas = container.append("canvas")
      .attr("width", width * devicePixelRatio)
      .attr("height", height * devicePixelRatio)
      .style("width", width + "px")
      .style("height", height + "px")
      .style("margin-top", margin.top + "px")
      .style("margin-left", margin.left + "px");

  ctx = canvas.node().getContext("2d");
  ctx.globalCompositeOperation = 'darken';
  ctx.globalAlpha = 0.15;
  ctx.lineWidth = 1.5;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  
  var output = d3.select("#vis1").append("pre");

  var axes = svg.selectAll(".axis")
      .data(dimensions)
    .enter().append("g")
      .attr("class", function(d) { return "axis " + d.key.replace(/ /g, "_"); })
      .attr("transform", function(d,i) { return "translate(" + xscale(i) + ")"; });

  
  var data;
  //d3.csv("paralleldata.csv", function(error, dataInCall) {
 // d3.csv("top500.csv", function(error, dataInCall) {
    //if (error) throw error;
    // debugger;
    // shuffle the data!
    //data = dataInCall;
    //console.log("in parallel plots"); 
    //console.log(data); 
    //data = d3.shuffle(data);

    data.forEach(function(d) {
      dimensions.forEach(function(p) {
        d[p.key] = !d[p.key] ? null : p.type.coerce(d[p.key]);
      });

      // truncate long text strings to fit in data table
      for (var key in d) {
        if (d[key] && d[key].length > 35) d[key] = d[key].slice(0,36);
      }
    });

    // type/dimension default setting happens here
    dimensions.forEach(function(dim) {
      if (!("domain" in dim)) {
        // detect domain using dimension type's extent function
        dim.domain = d3_functor(dim.type.extent)(data.map(function(d) { return d[dim.key]; }));
      }
      if (!("scale" in dim)) {
        // use type's default scale for dimension
        dim.scale = dim.type.defaultScale.copy();
      }
      dim.scale.domain(dim.domain);
    });

    render = renderQueue(draw).rate(50);

    ctx.clearRect(0,0,width,height);
    ctx.globalAlpha = d3.min([0.85/Math.pow(data.length,0.3),1]);
    render(data);

    axes.append("g")
        .each(function(d) {
          var renderAxis = "axis" in d
            ? d.axis.scale(d.scale)  // custom axis
            : yAxis.scale(d.scale);  // default axis
          d3.select(this).call(renderAxis);
        })
      .append("text")
        .attr("class", "title")
        .attr("text-anchor", "start")
        .text(function(d) { return "description" in d ? d.description : d.key; });

    // Add and store a brush for each axis.
    axes.append("g")
        .attr("class", "brush")
        .each(function(d) {
          d3.select(this).call(d.brush = d3.brushY()
            .extent([[-10,0], [10,height]])
            .on("start", brushstart)
            .on("brush", brush)
            .on("end", brush)
          )
        })
      .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    d3.selectAll(".axis.Sector .tick text")
      .style("fill", "black");

     output.text(d3.tsvFormat(data.slice(0,24)));

    function project(d) {
      return dimensions.map(function(p,i) {
        // check if data element has property and contains a value
        if (
          !(p.key in d) ||
          d[p.key] === null
        ) return null;

        return [xscale(i),p.scale(d[p.key])];
      });
    };

    function draw(d) {
      ctx.strokeStyle = getColor(d.state);
      ctx.beginPath();
      var coords = project(d);
      coords.forEach(function(p,i) {
        // this tricky bit avoids rendering null values as 0
        if (p === null) {
          // this bit renders horizontal lines on the previous/next
          // dimensions, so that sandwiched null values are visible
          if (i > 0) {
            var prev = coords[i-1];
            if (prev !== null) {
              ctx.moveTo(prev[0],prev[1]);
              ctx.lineTo(prev[0]+6,prev[1]);
            }
          }
          if (i < coords.length-1) {
            var next = coords[i+1];
            if (next !== null) {
              ctx.moveTo(next[0]-6,next[1]);
            }
          }
          return;
        }

        if (i == 0) {
          ctx.moveTo(p[0],p[1]);
          return;
        }

        ctx.lineTo(p[0],p[1]);
      });
      ctx.stroke();
    }

    function brushstart() {
      d3.event.sourceEvent.stopPropagation();
    }

 // }); 

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
      render.invalidate();

      var actives = [];
      svg.selectAll(".axis .brush")
        .filter(function(d) {
          return d3.brushSelection(this);
        })
        .each(function(d) {
          actives.push({
            dimension: d,
            extent: d3.brushSelection(this)
          });
        });

      var selected = data.filter(function(d) {
        if (actives.every(function(active) {
            var dim = active.dimension;
            // test if point is within extents for each active brush
            return dim.type.within(d[dim.key], active.extent, dim);
          })) {
          return true;
        }
      });

      console.log(selected)
      //Global Variable
      Interaction_Selected_Data = selected;
      //getGlobalVar(selected);
      //Global Variable END

      ctx.clearRect(0,0,width,height);
      ctx.globalAlpha = d3.min([0.85/Math.pow(selected.length,0.3),1]);
      render(selected);

      // debugger;
      //UPDATE other Graph
      // var availableSector = Interaction_Selected_Data.map(d => d.Sector);

      // var availablePriceMinMax = d3.extent(Interaction_Selected_Data, d=>d.Price);

      // var filtered  = combinedData;
      // if ( conditionPanel.Sector != 'All' ) {
      //   filtered = filtered.filter(d=> d["GICS Sector"] == conditionPanel.Sector);
      // } else {
      //   filtered = filtered.filter(d=> availableSector.includes(d["GICS Sector"]));
      // }
      // if ( conditionPanel.Company != 'Not Specified' ) {
      //   filtered = filtered.filter(d=> d.Security.includes(conditionPanel.Company));
      // }

      // if(!availableSector.includes(conditionPanel.Sector) && 
      //     conditionPanel.Sector != 'All') {
      //   alert("Make Sure Control Panel and Selected Parallel Coordinates sharing common sectors");
      // }
      // debugger;

     //  getMarkerCluster(map,filtered);

     output.text(d3.tsvFormat(selected.slice(0,24)));
    }


 
};



 function d3_functor(v) {
    return typeof v === "function" ? v : function() { return v; };
  };

  function getSankeyDataWrapper() {
    //color(Interaction_Selected_Data[0].Sector)
    getSankeyData(Interaction_Selected_Data[0].Sector, getColor(Interaction_Selected_Data[0].Sector));
  }

