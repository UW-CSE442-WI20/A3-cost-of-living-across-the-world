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
      var valueExtent = d3.extent(data, function(d) { return scaleCircles(d); })
      var colorScale = d3.scaleSequential()
        .domain(valueExtent)
        .interpolator(d3.interpolateCool);
      // var max_total = d3.max(data['Total'], function(d) { return +d.Total; })
      // var colorScale = d3.scaleLinear().domain([0, 100941.6627]).range(['beige', 'red']);
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

      // Add circles
      var circle = g.selectAll("circle")
          .data(data)
          .enter().append("circle")
              .attr("r", 3) // radius
              .attr("cx", function(d){ return projection([+d.Longitude, +d.Latitude])[0] }) // coordinates
              .attr("cy", function(d){ return projection([+d.Longitude, +d.Latitude])[1] })
              .style("fill", function(d){ return colorScale(scaleCircles(d))}) // scale value to color
              .attr("fill-opacity", .7)
              .attr("stroke", "black")
              .attr("stroke-width", 0.2)

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
    }
  }

  function scaleCircles(d) {
    var subs = document.querySelectorAll('.subcategory');
    var filteredTotal = 0;
    // console.log(subs.length);
    // console.log(subs[0].parentNode.getElementsByTagName('span')[0].innerHTML);
    for (var i = 0; i < subs.length; i++) {
      if (subs[i].checked) {
        filteredTotal += (+d[subs[i].parentNode.getElementsByTagName('span')[0].innerHTML]);
        // var temp = '+d.' + subs[i].parentNode.getElementsByTagName('span')[0].innerHTML;
        console.log(+d[subs[i].parentNode.getElementsByTagName('span')[0].innerHTML]);
      }
    }
    return filteredTotal;
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