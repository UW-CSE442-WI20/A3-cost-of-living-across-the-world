"use strict";
(function() {
  window.addEventListener("load", init);

  function init() {
    updateMap();
    const categories = document.querySelectorAll('.category');
    const subCategories = document.querySelectorAll('.subcategory');

    // Set Total Onclick Listener
    document.getElementById('total').onclick = function() {
      categories.forEach(category => {
        category.checked = this.checked;
      })

      subCategories.forEach(subCategory => {
        subCategory.checked = this.checked;
        checkUpperCategories();
      })
      updateMap();
    }

    // Set Categories Onclick Listener
    categories.forEach(category => {
      category.onclick = function () {
        const catSubCategories = document.querySelectorAll('.' + this.id);
        catSubCategories.forEach(catSubCategory => {
          catSubCategory.checked = this.checked;
      })
        checkUpperCategories();
        updateMap();
      }
    })

    // Set SubCategories Onclick Listener
    subCategories.forEach(subCategory => {
      subCategory.onclick = function () {
        const category = subCategory.classList[0];
        const subCategoriesCat = document.getElementById(category);
        const count = document.querySelectorAll('.' + category + ':checked').length;
        const subCategoriesCount = document.querySelectorAll('.' + category).length;

        subCategoriesCat.checked = (count === subCategoriesCount);
        checkUpperCategories();
        updateMap();
      }
    })
  }

  function updateMap() {

    // The svg
    var svg = d3.select("svg");
    svg.selectAll("*").remove();
    
    var width = +svg.attr("width"),
    height = +svg.attr("height");

    // Map and projection
    var projection = d3.geoMercator()
    .center([0,20])                // GPS of location to zoom on
    .scale(99)                       // This is like the zoom
    .translate([ width/2, height/2 ])

    d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
    .defer(d3.csv, "https://gist.githubusercontent.com/mtgemo/407034207687ace3529864158ea46856/raw/1b6c0ffa28890dc514b917344e27eb6e128e8ac0/usd-total-CoL.csv") // Position of circles
    .await(ready);

    function ready(error, dataGeo, data) {

      // Add a scale for bubble size
      var valueExtent = d3.extent(data, function(d) {return +scaleCircles(d); })

      var colorScale = d3.scaleSequential()
        .domain(valueExtent)
        .interpolator(d3.scaleOrdinal(d3.schemeOrRd[5]));

      var Tooltip = svg
          .append("text")
          .attr("text-anchor", "end")
          .style("fill", "black")
          .attr("x", width - 10)
          .attr("y", height - 30)
          .attr("width", 90)
          .style("font-size", 14)


  // Three function that change the tooltip when user hover / move / leave a cell
  // Will make the tooltip visible once a user hovers over an object that contains information to show
  var mouseover = function (d) {
      Tooltip.style("opacity", 1)
  }

  // This adds the data to the tooltip that will be displayed to the user
  var mousemove = function (d) {
      Tooltip
          .html(d.City + ", " + d.Country + " - Total Cost of Living: $" + scaleCircles(d) + "")
  }

  // Will make the tooltip invisible once the users mouse moves off of an object that contains information
  var mouseleave = function (d) {
      Tooltip.style("opacity", 0)
  }

      var g = svg.append("g");

      // Draw the map
      g.selectAll("path")
      .data(dataGeo.features)
      .enter()
      .append("path")
      .attr("transform", function(d) { return "translate(" + d + ")"; }) // zooming effect
      .attr("fill", "#b8b8b8")
      .attr("d", d3.geoPath()
          .projection(projection)
      )
      .style("stroke", "none")
      .style("opacity", .3)

      // Make the map zoomable
    svg.append("rect")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoom));

    function zoom() {
      g.attr("transform", d3.event.transform);
      circle.attr("transform", d3.event.transform);
    }


    if (valueExtent[0] !== 0 && valueExtent[1] !== 0) {

      // Add circles
      var circle = svg.selectAll("circle")
          .data(data)
          .enter().append("circle")
              .attr("r", 3) // radius
              .attr("cx", function(d){ return projection([+d.Longitude, +d.Latitude])[0] }) // coordinates
              .attr("cy", function(d){ return projection([+d.Longitude, +d.Latitude])[1] })
              .style("fill", function(d){ return colorScale(scaleCircles(d))}) // scale value to color
              .attr("fill-opacity", .7)
              .attr("stroke", "black")
              .attr("stroke-width", 0.2)
              .on("mouseover", mouseover) // These three functions are what makes our tooltip appear, display our data,
              .on("mousemove", mousemove) // and make the tooltip disappear in the end
              .on("mouseleave", mouseleave)
              .call(d3.zoom()
                  .on("zoom", zoom))


              var margin = 0,
              widthTwo = 250 - margin,
              heightTwo = 20 - margin;
    
              var linearGradient = svg.append("defs")
                  .append("linearGradient")
                  .attr("id", "linear-gradient");
    
              linearGradient.append("stop")
                  .attr("offset", "0%")
                  .attr("stop-color", colorScale(10000));
    
              linearGradient.append("stop")
                  .attr("offset", "25%")
                  .attr("stop-color", colorScale(20000));
    
              linearGradient.append("stop")
                  .attr("offset", "50%")
                  .attr("stop-color", colorScale(30000));
    
              linearGradient.append("stop")
                  .attr("offset", "75%")
                  .attr("stop-color", colorScale(40000));
    
              linearGradient.append("stop")
                  .attr("offset", "100%")
                  .attr("stop-color", colorScale(50000));
    
              svg.append("rect")
                  .attr("x", width - widthTwo - 50)
                  .attr("y", 50)
                  .attr("width", widthTwo)
                  .attr("height", heightTwo)
                  .style("fill", "url(#linear-gradient)");
              svg.append("text")
                    .attr("class", "caption")
                    .attr("x", width - widthTwo - 50)
                    .attr("y", 40)
                    .attr("fill", "#000")
                    .attr("font-size", 14)
                    .attr("text-anchor", "start")
                    .text("Total Cost (USD)");
              svg.append("text")
                  .attr("class", "caption")
                  .attr("x", width - widthTwo - 50)
                  .attr("y", 90)
                  .attr("fill", "#000")
                  .attr("font-size", 14)
                  .attr("text-anchor", "start")
                  .text(valueExtent[0]);
              svg.append("text")
                .attr("class", "caption")
                .attr("x", width - 75)
                .attr("y", 90)
                .attr("fill", "#000")
                .attr("font-size", 14)
                .attr("text-anchor", "start")
                .text(valueExtent[1]);
    }
  
    }
  }

  function scaleCircles(d) {
    var subs = document.querySelectorAll('.subcategory');
    var filteredTotal = 0;
    for (var i = 0; i < subs.length; i++) {
      if (subs[i].checked) {
        filteredTotal += (+d[subs[i].parentNode.getElementsByTagName('span')[0].innerHTML]);
      }
    }
    return filteredTotal.toFixed(2);
  }

  function checkUpperCategories() {
    const cats = document.querySelectorAll('.category:checked');
    const total = document.getElementById('total');
    if (cats.length === 5) {
      total.checked = true;
    } else {
      total.checked = false;
    }
  }
})();