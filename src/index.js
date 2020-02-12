(function() {
    window.addEventListener("load", init);

  function init() {

  // The svg
  var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

  // Map and projection
  var projection = d3.geoMercator()
      .center([0,20])                // GPS of location to zoom on
      .scale(99)                       // This is like the zoom
      .translate([ width/2, height/2 ]);

  // Loading data
  d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
    .defer(d3.csv, "https://gist.githubusercontent.com/mtgemo/407034207687ace3529864158ea46856/raw/1b6c0ffa28890dc514b917344e27eb6e128e8ac0/usd-total-CoL.csv") // Position of circles
    .await(ready);

  function ready(error, dataGeo, data) {
      // Create a color scale
      var valueExtent = d3.extent(data, function (d) {
          return +d.Total;
      })
      var colorScale = d3.scaleSequential()
          .domain(valueExtent)
          .interpolator(d3.scaleOrdinal(d3.schemeBlues[7])); // color scheme


      var valueExtent = d3.extent(data, function (d) {
          return +d.Total;
      })
      var size = d3.scaleSqrt()
          .domain(valueExtent)
          .range([1, 50])

      var g = svg.append("g");

      // Create a tooltip (not working currently)
      var Tooltip =
          d3.select("#body").append("div")
              .attr("class", "tooltip")
              .style("opacity", 1)
              .style("background-color", "white")
              .style("border", "solid")
              .style("border-width", "2px")
              .style("border-radius", "5px")
              .style("padding", "5px");

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function (d) {
          Tooltip.style("opacity", 1)
      }
      var mousemove = function (d) {
          Tooltip
              .html(d.City + ", " + d.Country + "<br>" + "Total COL: $" + d.Total + "")
              .style("left", (d3.mouse(this)[0] + 10) + "px")
              .style("top", (d3.mouse(this)[1]) + "px")
      }
      var mouseleave = function (d) {
          Tooltip.style("opacity", 0)
      }

      // Draw the map
      g.selectAll("path")
          .data(dataGeo.features)
          .enter()
          .append("path")
          .attr("transform", function (d) {
              return "translate(" + d + ")";
          }) // zooming effect
          .attr("fill", "#b8b8b8")
          .attr("d", d3.geoPath()
              .projection(projection)
          )
          .style("stroke", "none")
          .style("opacity", .3)
      // .call(legend)

      // Make the map zoomable
      svg.append("rect")
          .attr("fill", "none")
          .attr("pointer-events", "all")
          .attr("width", width)
          .attr("height", height)
          .call(d3.zoom()
          // .scaleExtent([1, 8])
              .on("zoom", zoom));

      // Add circles
      var circle = svg.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("r", function (d) {
              return size(+d.Total) / 5
          }) // radius
          .attr("cx", function (d) {
              return projection([+d.Longitude, +d.Latitude])[0]
          }) // coordinates
          .attr("cy", function (d) {
              return projection([+d.Longitude, +d.Latitude])[1]
          })
          .style("fill", function (d) {
              return colorScale(+d.Total)
          }) // scale value to color
          .attr("fill-opacity", .7)
          .attr("stroke", "black")
          .attr("stroke-width", 0.2)
          // .attr("transform", d3.event.transform)
          // .call(d3.zoom()
          //     .scaleExtent([1, 8])
          //     .on("zoom", zoom))
          .call(d3.zoom()
          // .scaleExtent([1, 8])
              .on("zoom", zoom))
          .on("mouseover", mouseover) // function calls for tooltip
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)

      function zoom() {
          g.attr("transform", d3.event.transform);
          circle.attr("transform", d3.event.transform);
      }

      // Add title and explanation (can change later)
      svg
          .append("text")
          .attr("text-anchor", "end")
          .style("fill", "black")
          .attr("x", width - 10)
          .attr("y", height - 30)
          .attr("width", 90)
          .html("COST OF LIVING")
          .style("font-size", 14)






      legend ({
          color: d3.scaleSequential([0, 100], d3.scaleOrdinal(d3.schemeBlues[7])),
          title: "Total Cost"
      })









      // svg.append("rect")
          // .attr("width", 300)
          // .attr("height", 20)
          // .data(colorScale.range())
          // .enter().append("stop")
          // .attr("offset", function (d, i) {
          //     return i / (colorScale.range().length - 1);
          // })
      // .attr("stop-color", function(d) { return d; });
      // .attr("offset", "0%")
      // .attr("stop-color", "#ffa474") //light blue
      // .attr("offset", "100%")
      // .attr("stop-color", "#8b0000") //dark blue
      // .style("fill", colorScale);


      //
      // legend = g => {
      //     const width = 240;
      //
      //     g.append("image")
      //         .attr("width", width)
      //         .attr("height", 8)
      //         .attr("preserveAspectRatio", "none")
      //         .attr("xlink:href", ramp(color.interpolator()).toDataURL());
      //
      //     g.append("text")
      //         .attr("class", "caption")
      //         .attr("y", -6)
      //         .attr("fill", "#000")
      //         .attr("text-anchor", "start")
      //         .attr("font-weight", "bold")
      //         .text(data.title);
      //
      //     g.call(d3.axisBottom(d3.scaleTime(color.domain(), [0, width]))
      //         .ticks(6)
      //         .tickSize(13))
      //         .select(".domain")
      //         .remove();
      // }


      // --------------- //
      // ADD LEGEND //
      // --------------- //

      // CODE BELOW THIS LINE IS FOR REFERENCE ONLY
      // TAKEN FROM THE ORIGINAL BUBBLE MAP TEMPLATE
      // LEGEND HASN'T BEEN DONE
      //   legend({
      //       color: d3.scaleOrdinal(d3.schemeBlues[7]),
      //     // color: d3.scaleSequential([0, 100], d3.interpolateViridis),
      //     title: "Temperature (°F)"
      //   })
      //   // Add legend: circles
      //   var valuesToShow = [1000,40000,150000]
      //   var xCircle = 40
      //   var xLabel = 90
      //   svg
      //     .selectAll("legend")
      //     .data(valuesToShow)
      //     .enter()
      //     .append("circle")
      //       .attr("cx", xCircle)
      //       .attr("cy", function(d){ return height - size(d) } )
      //       .attr("r", function(d){ return size(d) })
      //       .style("fill", "none")
      //       .attr("stroke", "black")
      //
      //   // Add legend: segments
      //   svg
      //     .selectAll("legend")
      //     .data(valuesToShow)
      //     .enter()
      //     .append("line")
      //       .attr('x1', function(d){ return xCircle + size(d) } )
      //       .attr('x2', xLabel)
      //       .attr('y1', function(d){ return height - size(d) } )
      //       .attr('y2', function(d){ return height - size(d) } )
      //       .attr('stroke', 'black')
      //       .style('stroke-dasharray', ('2,2'))
      //
      //   // Add legend: labels
      //   svg
      //     .selectAll("legend")
      //     .data(valuesToShow)
      //     .enter()
      //     .append("text")
      //       .attr('x', xLabel)
      //       .attr('y', function(d){ return height - size(d) } )
      //       .text( function(d){ return d } )
      //       .style("font-size", 10)
      //       .attr('alignment-baseline', 'middle')
      // }
      //
      // }
  }
})();
"use strict";
