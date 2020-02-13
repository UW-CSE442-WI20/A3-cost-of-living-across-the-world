// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
"use strict";

(function () {
  window.addEventListener("load", init);

  function init() {
    updateMap();
    var categories = document.querySelectorAll('.category');
    var subCategories = document.querySelectorAll('.subcategory'); // Set Total Onclick Listener

    document.getElementById('total').onclick = function () {
      var _this = this;

      categories.forEach(function (category) {
        category.checked = _this.checked;
      });
      subCategories.forEach(function (subCategory) {
        subCategory.checked = _this.checked;
        checkUpperCategories();
      });
      updateMap();
    }; // Set Categories Onclick Listener


    categories.forEach(function (category) {
      category.onclick = function () {
        var _this2 = this;

        var catSubCategories = document.querySelectorAll('.' + this.id);
        catSubCategories.forEach(function (catSubCategory) {
          catSubCategory.checked = _this2.checked;
        });
        checkUpperCategories();
        updateMap();
      };
    }); // Set SubCategories Onclick Listener

    subCategories.forEach(function (subCategory) {
      subCategory.onclick = function () {
        var category = subCategory.classList[0];
        var subCategoriesCat = document.getElementById(category);
        var count = document.querySelectorAll('.' + category + ':checked').length;
        var subCategoriesCount = document.querySelectorAll('.' + category).length;
        subCategoriesCat.checked = count === subCategoriesCount;
        checkUpperCategories();
        updateMap();
      };
    });
  }

  function updateMap() {
    // The svg
    var svg = d3.select("svg");
    svg.selectAll("*").remove();
    var width = +svg.attr("width"),
        height = +svg.attr("height"); // Map and projection

    var projection = d3.geoMercator().center([0, 20]) // GPS of location to zoom on
    .scale(99) // This is like the zoom
    .translate([width / 2, height / 2]);
    d3.queue().defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson") // World shape
    .defer(d3.csv, "https://gist.githubusercontent.com/mtgemo/407034207687ace3529864158ea46856/raw/1b6c0ffa28890dc514b917344e27eb6e128e8ac0/usd-total-CoL.csv") // Position of circles
    .await(ready);

    function ready(error, dataGeo, data) {
      // Add a scale for bubble size
      var valueExtent = d3.extent(data, function (d) {
        return +scaleCircles(d);
      });
      var colorScale = d3.scaleSequential().domain(valueExtent).interpolator(d3.scaleOrdinal(d3.schemeOrRd[5]));
      var Tooltip = svg.append("text").attr("text-anchor", "end").style("fill", "black").attr("x", width - 10).attr("y", height - 30).attr("width", 90).style("font-size", 14); // Three function that change the tooltip when user hover / move / leave a cell
      // Will make the tooltip visible once a user hovers over an object that contains information to show

      var mouseover = function mouseover(d) {
        Tooltip.style("opacity", 1);
      }; // This adds the data to the tooltip that will be displayed to the user


      var mousemove = function mousemove(d) {
        Tooltip.html(d.City + ", " + d.Country + " - Total Cost of Living: $" + scaleCircles(d) + "");
      }; // Will make the tooltip invisible once the users mouse moves off of an object that contains information


      var mouseleave = function mouseleave(d) {
        Tooltip.style("opacity", 0);
      };

      var g = svg.append("g"); // Draw the map

      g.selectAll("path").data(dataGeo.features).enter().append("path").attr("transform", function (d) {
        return "translate(" + d + ")";
      }) // zooming effect
      .attr("fill", "#b8b8b8").attr("d", d3.geoPath().projection(projection)).style("stroke", "none").style("opacity", .3); // Make the map zoomable

      svg.append("rect").attr("fill", "none").attr("pointer-events", "all").attr("width", width).attr("height", height).call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoom));

      function zoom() {
        g.attr("transform", d3.event.transform);
        circle.attr("transform", d3.event.transform);
      }

      if (valueExtent[0] !== 0 && valueExtent[1] !== 0) {
        // Add circles
        var circle = svg.selectAll("circle").data(data).enter().append("circle").attr("r", 3) // radius
        .attr("cx", function (d) {
          return projection([+d.Longitude, +d.Latitude])[0];
        }) // coordinates
        .attr("cy", function (d) {
          return projection([+d.Longitude, +d.Latitude])[1];
        }).style("fill", function (d) {
          return colorScale(scaleCircles(d));
        }) // scale value to color
        .attr("fill-opacity", .7).attr("stroke", "black").attr("stroke-width", 0.2).on("mouseover", mouseover) // These three functions are what makes our tooltip appear, display our data,
        .on("mousemove", mousemove) // and make the tooltip disappear in the end
        .on("mouseleave", mouseleave).call(d3.zoom().on("zoom", zoom));
        var margin = 0,
            widthTwo = 250 - margin,
            heightTwo = 20 - margin;
        var linearGradient = svg.append("defs").append("linearGradient").attr("id", "linear-gradient");
        linearGradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(10000));
        linearGradient.append("stop").attr("offset", "25%").attr("stop-color", colorScale(20000));
        linearGradient.append("stop").attr("offset", "50%").attr("stop-color", colorScale(30000));
        linearGradient.append("stop").attr("offset", "75%").attr("stop-color", colorScale(40000));
        linearGradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(50000));
        svg.append("rect").attr("x", width - widthTwo - 50).attr("y", 50).attr("width", widthTwo).attr("height", heightTwo).style("fill", "url(#linear-gradient)");
        svg.append("text").attr("class", "caption").attr("x", width - widthTwo - 50).attr("y", 40).attr("fill", "#000").attr("font-size", 14).attr("text-anchor", "start").text("Total Cost (USD)");
        svg.append("text").attr("class", "caption").attr("x", width - widthTwo - 50).attr("y", 90).attr("fill", "#000").attr("font-size", 14).attr("text-anchor", "start").text("0");
        svg.append("text").attr("class", "caption").attr("x", width - 75).attr("y", 90).attr("fill", "#000").attr("font-size", 14).attr("text-anchor", "start").text("max");
      }
    }
  }

  function scaleCircles(d) {
    var subs = document.querySelectorAll('.subcategory');
    var filteredTotal = 0;

    for (var i = 0; i < subs.length; i++) {
      if (subs[i].checked) {
        filteredTotal += +d[subs[i].parentNode.getElementsByTagName('span')[0].innerHTML];
      }
    }

    return filteredTotal.toFixed(2);
  }

  function checkUpperCategories() {
    var cats = document.querySelectorAll('.category:checked');
    var total = document.getElementById('total');

    if (cats.length === 5) {
      total.checked = true;
    } else {
      total.checked = false;
    }
  }
})();
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57654" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map