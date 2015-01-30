(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (root, factory) {

  // Node.
  if(typeof module === 'object' && typeof module.exports === 'object') {
    exports = module.exports = factory();
  }

  // Browser Global.
  if(typeof window === "object") {
    root.Terraformer = factory();
  }

}(this, function(){
  var exports = {},
      EarthRadius = 6378137,
      DegreesPerRadian = 57.295779513082320,
      RadiansPerDegree =  0.017453292519943,
      MercatorCRS = {
        "type": "link",
        "properties": {
          "href": "http://spatialreference.org/ref/sr-org/6928/ogcwkt/",
          "type": "ogcwkt"
        }
      },
      GeographicCRS = {
        "type": "link",
        "properties": {
          "href": "http://spatialreference.org/ref/epsg/4326/ogcwkt/",
          "type": "ogcwkt"
        }
      };

  /*
  Internal: isArray function
  */
  function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  }

  /*
  Internal: safe warning
  */
  function warn() {
    var args = Array.prototype.slice.apply(arguments);

    if (typeof console !== undefined && console.warn) {
      console.warn.apply(console, args);
    }
  }

  /*
  Internal: Extend one object with another.
  */
  function extend(destination, source) {
    for (var k in source) {
      if (source.hasOwnProperty(k)) {
        destination[k] = source[k];
      }
    }
    return destination;
  }

  /*
  Public: Calculate an bounding box for a geojson object
  */
  function calculateBounds (geojson) {
    if(geojson.type){
      switch (geojson.type) {
        case 'Point':
          return [ geojson.coordinates[0], geojson.coordinates[1], geojson.coordinates[0], geojson.coordinates[1]];

        case 'MultiPoint':
          return calculateBoundsFromArray(geojson.coordinates);

        case 'LineString':
          return calculateBoundsFromArray(geojson.coordinates);

        case 'MultiLineString':
          return calculateBoundsFromNestedArrays(geojson.coordinates);

        case 'Polygon':
          return calculateBoundsFromNestedArrays(geojson.coordinates);

        case 'MultiPolygon':
          return calculateBoundsFromNestedArrayOfArrays(geojson.coordinates);

        case 'Feature':
          return geojson.geometry? calculateBounds(geojson.geometry) : null;

        case 'FeatureCollection':
          return calculateBoundsForFeatureCollection(geojson);

        case 'GeometryCollection':
          return calculateBoundsForGeometryCollection(geojson);

        default:
          throw new Error("Unknown type: " + geojson.type);
      }
    }
    return null;
  }

  /*
  Internal: Calculate an bounding box from an nested array of positions
  [
    [
      [ [lng, lat],[lng, lat],[lng, lat] ]
    ]
    [
      [lng, lat],[lng, lat],[lng, lat]
    ]
    [
      [lng, lat],[lng, lat],[lng, lat]
    ]
  ]
  */
  function calculateBoundsFromNestedArrays (array) {
    var x1 = null, x2 = null, y1 = null, y2 = null;

    for (var i = 0; i < array.length; i++) {
      var inner = array[i];

      for (var j = 0; j < inner.length; j++) {
        var lonlat = inner[j];

        var lon = lonlat[0];
        var lat = lonlat[1];

        if (x1 === null) {
          x1 = lon;
        } else if (lon < x1) {
          x1 = lon;
        }

        if (x2 === null) {
          x2 = lon;
        } else if (lon > x2) {
          x2 = lon;
        }

        if (y1 === null) {
          y1 = lat;
        } else if (lat < y1) {
          y1 = lat;
        }

        if (y2 === null) {
          y2 = lat;
        } else if (lat > y2) {
          y2 = lat;
        }
      }
    }

    return [x1, y1, x2, y2 ];
  }

  /*
  Internal: Calculate a bounding box from an array of arrays of arrays
  [
    [ [lng, lat],[lng, lat],[lng, lat] ]
    [ [lng, lat],[lng, lat],[lng, lat] ]
    [ [lng, lat],[lng, lat],[lng, lat] ]
  ]
  */
  function calculateBoundsFromNestedArrayOfArrays (array) {
    var x1 = null, x2 = null, y1 = null, y2 = null;

    for (var i = 0; i < array.length; i++) {
      var inner = array[i];

      for (var j = 0; j < inner.length; j++) {
        var innerinner = inner[j];
        for (var k = 0; k < innerinner.length; k++) {
          var lonlat = innerinner[k];

          var lon = lonlat[0];
          var lat = lonlat[1];

          if (x1 === null) {
            x1 = lon;
          } else if (lon < x1) {
            x1 = lon;
          }

          if (x2 === null) {
            x2 = lon;
          } else if (lon > x2) {
            x2 = lon;
          }

          if (y1 === null) {
            y1 = lat;
          } else if (lat < y1) {
            y1 = lat;
          }

          if (y2 === null) {
            y2 = lat;
          } else if (lat > y2) {
            y2 = lat;
          }
        }
      }
    }

    return [x1, y1, x2, y2];
  }

  /*
  Internal: Calculate a bounding box from an array of positions
  [
    [lng, lat],[lng, lat],[lng, lat]
  ]
  */
  function calculateBoundsFromArray (array) {
    var x1 = null, x2 = null, y1 = null, y2 = null;

    for (var i = 0; i < array.length; i++) {
      var lonlat = array[i];
      var lon = lonlat[0];
      var lat = lonlat[1];

      if (x1 === null) {
        x1 = lon;
      } else if (lon < x1) {
        x1 = lon;
      }

      if (x2 === null) {
        x2 = lon;
      } else if (lon > x2) {
        x2 = lon;
      }

      if (y1 === null) {
        y1 = lat;
      } else if (lat < y1) {
        y1 = lat;
      }

      if (y2 === null) {
        y2 = lat;
      } else if (lat > y2) {
        y2 = lat;
      }
    }

    return [x1, y1, x2, y2 ];
  }

  /*
  Internal: Calculate an bounding box for a feature collection
  */
  function calculateBoundsForFeatureCollection(featureCollection){
    var extents = [], extent;
    for (var i = featureCollection.features.length - 1; i >= 0; i--) {
      extent = calculateBounds(featureCollection.features[i].geometry);
      extents.push([extent[0],extent[1]]);
      extents.push([extent[2],extent[3]]);
    }

    return calculateBoundsFromArray(extents);
  }

  /*
  Internal: Calculate an bounding box for a geometry collection
  */
  function calculateBoundsForGeometryCollection(geometryCollection){
    var extents = [], extent;

    for (var i = geometryCollection.geometries.length - 1; i >= 0; i--) {
      extent = calculateBounds(geometryCollection.geometries[i]);
      extents.push([extent[0],extent[1]]);
      extents.push([extent[2],extent[3]]);
    }

    return calculateBoundsFromArray(extents);
  }

  function calculateEnvelope(geojson){
    var bounds = calculateBounds(geojson);
    return {
      x: bounds[0],
      y: bounds[1],
      w: Math.abs(bounds[0] - bounds[2]),
      h: Math.abs(bounds[1] - bounds[3])
    };
  }

  /*
  Internal: Convert radians to degrees. Used by spatial reference converters.
  */
  function radToDeg(rad) {
    return rad * DegreesPerRadian;
  }

  /*
  Internal: Convert degrees to radians. Used by spatial reference converters.
  */
  function degToRad(deg) {
    return deg * RadiansPerDegree;
  }

  /*
  Internal: Loop over each array in a geojson object and apply a function to it. Used by spatial reference converters.
  */
  function eachPosition(coordinates, func) {
    for (var i = 0; i < coordinates.length; i++) {
      // we found a number so lets convert this pair
      if(typeof coordinates[i][0] === "number"){
        coordinates[i] = func(coordinates[i]);
      }
      // we found an coordinates array it again and run THIS function against it
      if(typeof coordinates[i] === "object"){
        coordinates[i] = eachPosition(coordinates[i], func);
      }
    }
    return coordinates;
  }

  /*
  Public: Convert a GeoJSON Position object to Geographic (4326)
  */
  function positionToGeographic(position) {
    var x = position[0];
    var y = position[1];
    return [radToDeg(x / EarthRadius) - (Math.floor((radToDeg(x / EarthRadius) + 180) / 360) * 360), radToDeg((Math.PI / 2) - (2 * Math.atan(Math.exp(-1.0 * y / EarthRadius))))];
  }

  /*
  Public: Convert a GeoJSON Position object to Web Mercator (102100)
  */
  function positionToMercator(position) {
    var lng = position[0];
    var lat = Math.max(Math.min(position[1], 89.99999), -89.99999);
    return [degToRad(lng) * EarthRadius, EarthRadius/2.0 * Math.log( (1.0 + Math.sin(degToRad(lat))) / (1.0 - Math.sin(degToRad(lat))) )];
  }

  /*
  Public: Apply a function agaist all positions in a geojson object. Used by spatial reference converters.
  */
  function applyConverter(geojson, converter, noCrs){
    if(geojson.type === "Point") {
      geojson.coordinates = converter(geojson.coordinates);
    } else if(geojson.type === "Feature") {
      geojson.geometry = applyConverter(geojson.geometry, converter, true);
    } else if(geojson.type === "FeatureCollection") {
      for (var f = 0; f < geojson.features.length; f++) {
        geojson.features[f] = applyConverter(geojson.features[f], converter, true);
      }
    } else if(geojson.type === "GeometryCollection") {
      for (var g = 0; g < geojson.geometries.length; g++) {
        geojson.geometries[g] = applyConverter(geojson.geometries[g], converter, true);
      }
    } else {
      geojson.coordinates = eachPosition(geojson.coordinates, converter);
    }

    if(!noCrs){
      if(converter === positionToMercator){
        geojson.crs = MercatorCRS;
      }
    }

    if(converter === positionToGeographic){
      delete geojson.crs;
    }

    return geojson;
  }

  /*
  Public: Convert a GeoJSON object to ESRI Web Mercator (102100)
  */
  function toMercator(geojson) {
    return applyConverter(geojson, positionToMercator);
  }

  /*
  Convert a GeoJSON object to Geographic coordinates (WSG84, 4326)
  */
  function toGeographic(geojson) {
    return applyConverter(geojson, positionToGeographic);
  }


  /*
  Internal: -1,0,1 comparison function
  */
  function cmp(a, b) {
    if(a < b) {
      return -1;
    } else if(a > b) {
      return 1;
    } else {
      return 0;
    }
  }

  /*
  Internal: used for sorting
  */
  function compSort(p1, p2) {
    if (p1[0] > p2[0]) {
      return -1;
    } else if (p1[0] < p2[0]) {
      return 1;
    } else if (p1[1] > p2[1]) {
      return -1;
    } else if (p1[1] < p2[1]) {
      return 1;
    } else {
      return 0;
    }
  }



  function ccw(p1, p2, p3) {
    return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]);
  }

  function convexHull(points) {
    var i, t, k = 0;
    var hull = [ ];

    points = points.sort(compSort);

    /* lower hull */
    for (i = 0; i < points.length; ++i) {
      while (k >= 2 && ccw(hull[k-2], hull[k-1], points[i]) <= 0) --k;
      hull[k++] = points[i];
    }

    /* upper hull */
    for (i = points.length - 2, t = k+1; i >= 0; --i) {
      while (k >= t && ccw(hull[k-2], hull[k-1], points[i]) <= 0) --k;
      hull[k++] = points[i];
    }

    return hull;
  }

  function isConvex(points) {
    var ltz;

    for (var i = 0; i < points.length - 3; i++) {
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[i + 2];
      var v = [p2[0] - p1[0], p2[1] - p1[1]];

      // p3.x * v.y - p3.y * v.x + v.x * p1.y - v.y * p1.x
      var res = p3[0] * v[1] - p3[1] * v[0] + v[0] * p1[1] - v[1] * p1[0];

      if (i === 0) {
        if (res < 0) {
          ltz = true;
        } else {
          ltz = false;
        }
      } else {
        if (ltz && (res > 0) || !ltz && (res < 0)) {
          return false;
        }
      }
    }

    return true;
  }

  function coordinatesContainPoint(coordinates, point) {
    var contains = false;
    for(var i = -1, l = coordinates.length, j = l - 1; ++i < l; j = i) {
      if (((coordinates[i][1] <= point[1] && point[1] < coordinates[j][1]) ||
           (coordinates[j][1] <= point[1] && point[1] < coordinates[i][1])) &&
          (point[0] < (coordinates[j][0] - coordinates[i][0]) * (point[1] - coordinates[i][1]) / (coordinates[j][1] - coordinates[i][1]) + coordinates[i][0])) {
        contains = !contains;
      }
    }
    return contains;
  }

  function polygonContainsPoint(polygon, point) {
    if (polygon && polygon.length) {
      if (polygon.length === 1) { // polygon with no holes
        return coordinatesContainPoint(polygon[0], point);
      } else { // polygon with holes
        if (coordinatesContainPoint(polygon[0], point)) {
          for (var i = 1; i < polygon.length; i++) {
            if (coordinatesContainPoint(polygon[i], point)) {
              return false; // found in hole
            }
          }

          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  function edgeIntersectsEdge(a1, a2, b1, b2) {
    var ua_t = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]);
    var ub_t = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0]);
    var u_b  = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1]);

    if ( u_b !== 0 ) {
      var ua = ua_t / u_b;
      var ub = ub_t / u_b;

      if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
        return true;
      }
    }

    return false;
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function arraysIntersectArrays(a, b) {
    if (isNumber(a[0][0])) {
      if (isNumber(b[0][0])) {
        for (var i = 0; i < a.length - 1; i++) {
          for (var j = 0; j < b.length - 1; j++) {
            if (edgeIntersectsEdge(a[i], a[i + 1], b[j], b[j + 1])) {
              return true;
            }
          }
        }
      } else {
        for (var k = 0; k < b.length; k++) {
          if (arraysIntersectArrays(a, b[k])) {
            return true;
          }
        }
      }
    } else {
      for (var l = 0; l < a.length; l++) {
        if (arraysIntersectArrays(a[l], b)) {
          return true;
        }
      }
    }
    return false;
  }

  /*
  Internal: Returns a copy of coordinates for s closed polygon
  */
  function closedPolygon(coordinates) {
    var outer = [ ];

    for (var i = 0; i < coordinates.length; i++) {
      var inner = coordinates[i].slice();
      if (pointsEqual(inner[0], inner[inner.length - 1]) === false) {
        inner.push(inner[0]);
      }

      outer.push(inner);
    }

    return outer;
  }

  function pointsEqual(a, b) {
    for (var i = 0; i < a.length; i++) {

      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }

  function coordinatesEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    var na = a.slice().sort(compSort);
    var nb = b.slice().sort(compSort);

    for (var i = 0; i < na.length; i++) {
      if (na[i].length !== nb[i].length) {
        return false;
      }
      for (var j = 0; j < na.length; j++) {
        if (na[i][j] !== nb[i][j]) {
          return false;
        }
      }
    }

    return true;
  }

  /*
  Internal: An array of variables that will be excluded form JSON objects.
  */
  var excludeFromJSON = ["length"];

  /*
  Internal: Base GeoJSON Primitive
  */
  function Primitive(geojson){
    if(geojson){
      switch (geojson.type) {
      case 'Point':
        return new Point(geojson);

      case 'MultiPoint':
        return new MultiPoint(geojson);

      case 'LineString':
        return new LineString(geojson);

      case 'MultiLineString':
        return new MultiLineString(geojson);

      case 'Polygon':
        return new Polygon(geojson);

      case 'MultiPolygon':
        return new MultiPolygon(geojson);

      case 'Feature':
        return new Feature(geojson);

      case 'FeatureCollection':
        return new FeatureCollection(geojson);

      case 'GeometryCollection':
        return new GeometryCollection(geojson);

      default:
        throw new Error("Unknown type: " + geojson.type);
      }
    }
  }

  Primitive.prototype.toMercator = function(){
    return toMercator(this);
  };

  Primitive.prototype.toGeographic = function(){
    return toGeographic(this);
  };

  Primitive.prototype.envelope = function(){
    return calculateEnvelope(this);
  };

  Primitive.prototype.bbox = function(){
    return calculateBounds(this);
  };

  Primitive.prototype.convexHull = function(){
    var coordinates = [ ], i, j;
    if (this.type === 'Point') {
      return null;
    } else if (this.type === 'LineString' || this.type === 'MultiPoint') {
      if (this.coordinates && this.coordinates.length >= 3) {
        coordinates = this.coordinates;
      } else {
        return null;
      }
    } else if (this.type === 'Polygon' || this.type === 'MultiLineString') {
      if (this.coordinates && this.coordinates.length > 0) {
        for (i = 0; i < this.coordinates.length; i++) {
          coordinates = coordinates.concat(this.coordinates[i]);
        }
        if(coordinates.length < 3){
          return null;
        }
      } else {
        return null;
      }
    } else if (this.type === 'MultiPolygon') {
      if (this.coordinates && this.coordinates.length > 0) {
        for (i = 0; i < this.coordinates.length; i++) {
          for (j = 0; j < this.coordinates[i].length; j++) {
            coordinates = coordinates.concat(this.coordinates[i][j]);
          }
        }
        if(coordinates.length < 3){
          return null;
        }
      } else {
        return null;
      }
    } else if(this.type === "Feature"){
      var primitive = new Primitive(this.geometry);
      return primitive.convexHull();
    }

    return new Polygon({
      type: 'Polygon',
      coordinates: closedPolygon([convexHull(coordinates)])
    });
  };

  Primitive.prototype.toJSON = function(){
    var obj = {};
    for (var key in this) {
      if (this.hasOwnProperty(key) && excludeFromJSON.indexOf(key) === -1) {
        obj[key] = this[key];
      }
    }
    obj.bbox = calculateBounds(this);
    return obj;
  };

  Primitive.prototype.contains = function(primitive){
    return new Primitive(primitive).within(this);
  };

  Primitive.prototype.within = function(primitive) {
    var coordinates, i, contains;

    // point.within(point) :: equality
    if (primitive.type === "Point") {
      if (this.type === "Point") {
        return pointsEqual(this.coordinates, primitive.coordinates);

      }
    }

    // point.within(multilinestring)
    if (primitive.type === "MultiLineString") {
      if (this.type === "Point") {
        for (i = 0; i < primitive.coordinates.length; i++) {
          var linestring = { type: "LineString", coordinates: primitive.coordinates[i] };

          if (this.within(linestring)) {
            return true;
          }
        }
      }
    }

    // point.within(linestring), point.within(multipoint)
    if (primitive.type === "LineString" || primitive.type === "MultiPoint") {
      if (this.type === "Point") {
        for (i = 0; i < primitive.coordinates.length; i++) {
          if (this.coordinates.length !== primitive.coordinates[i].length) {
            return false;
          }

          if (pointsEqual(this.coordinates, primitive.coordinates[i])) {
            return true;
          }
        }
      }
    }

    if (primitive.type === "Polygon") {
      // polygon.within(polygon)
      if (this.type === "Polygon") {
        // check for equal polygons
        if (primitive.coordinates.length === this.coordinates.length) {
          for (i = 0; i < this.coordinates.length; i++) {
            if (coordinatesEqual(this.coordinates[i], primitive.coordinates[i])) {
              return true;
            }
          }
        }

        if (this.coordinates.length && polygonContainsPoint(primitive.coordinates, this.coordinates[0][0])) {
          return !arraysIntersectArrays(closedPolygon(this.coordinates), closedPolygon(primitive.coordinates));
        } else {
          return false;
        }

      // point.within(polygon)
      } else if (this.type === "Point") {
        return polygonContainsPoint(primitive.coordinates, this.coordinates);

      // linestring/multipoint withing polygon
      } else if (this.type === "LineString" || this.type === "MultiPoint") {
        if (!this.coordinates || this.coordinates.length === 0) {
          return false;
        }

        for (i = 0; i < this.coordinates.length; i++) {
          if (polygonContainsPoint(primitive.coordinates, this.coordinates[i]) === false) {
            return false;
          }
        }

        return true;

      // multilinestring.within(polygon)
      } else if (this.type === "MultiLineString") {
        for (i = 0; i < this.coordinates.length; i++) {
          var ls = new LineString(this.coordinates[i]);

          if (ls.within(primitive) === false) {
            contains++;
            return false;
          }
        }

        return true;

      // multipolygon.within(polygon)
      } else if (this.type === "MultiPolygon") {
        for (i = 0; i < this.coordinates.length; i++) {
          var p1 = new Primitive({ type: "Polygon", coordinates: this.coordinates[i] });

          if (p1.within(primitive) === false) {
            return false;
          }
        }

        return true;
      }

    }

    if (primitive.type === "MultiPolygon") {
      // point.within(multipolygon)
      if (this.type === "Point") {
        if (primitive.coordinates.length) {
          for (i = 0; i < primitive.coordinates.length; i++) {
            coordinates = primitive.coordinates[i];
            if (polygonContainsPoint(coordinates, this.coordinates) && arraysIntersectArrays([this.coordinates], primitive.coordinates) === false) {
              return true;
            }
          }
        }

        return false;
      // polygon.within(multipolygon)
      } else if (this.type === "Polygon") {
        for (i = 0; i < this.coordinates.length; i++) {
          if (primitive.coordinates[i].length === this.coordinates.length) {
            for (j = 0; j < this.coordinates.length; j++) {
              if (coordinatesEqual(this.coordinates[j], primitive.coordinates[i][j])) {
                return true;
              }
            }
          }
        }

        if (arraysIntersectArrays(this.coordinates, primitive.coordinates) === false) {
          if (primitive.coordinates.length) {
            for (i = 0; i < primitive.coordinates.length; i++) {
              coordinates = primitive.coordinates[i];
              if (polygonContainsPoint(coordinates, this.coordinates[0][0]) === false) {
                contains = false;
              } else {
                contains = true;
              }
            }

            return contains;
          }
        }

      // linestring.within(multipolygon), multipoint.within(multipolygon)
      } else if (this.type === "LineString" || this.type === "MultiPoint") {
        for (i = 0; i < primitive.coordinates.length; i++) {
          var p = { type: "Polygon", coordinates: primitive.coordinates[i] };

          if (this.within(p)) {
            return true;
          }

          return false;
        }

      // multilinestring.within(multipolygon)
      } else if (this.type === "MultiLineString") {
        for (i = 0; i < this.coordinates.length; i++) {
          var lines = new LineString(this.coordinates[i]);

          if (lines.within(primitive) === false) {
            return false;
          }
        }

        return true;

      // multipolygon.within(multipolygon)
      } else if (this.type === "MultiPolygon") {
        for (i = 0; i < primitive.coordinates.length; i++) {
          var mpoly = { type: "Polygon", coordinates: primitive.coordinates[i] };

          if (this.within(mpoly) === false) {
            return false;
          }
        }

        return true;
      }
    }

    // default to false
    return false;
  };

  Primitive.prototype.intersects = function(primitive) {
    // if we are passed a feature, use the polygon inside instead
    if (primitive.type === 'Feature') {
      primitive = primitive.geometry;
    }

    var p = new Primitive(primitive);
    if (this.within(primitive) || p.within(this)) {
      return true;
    }


    if (this.type !== 'Point' && this.type !== 'MultiPoint' &&
        primitive.type !== 'Point' && primitive.type !== 'MultiPoint') {
      return arraysIntersectArrays(this.coordinates, primitive.coordinates);
    } else if (this.type === 'Feature') {
      // in the case of a Feature, use the internal primitive for intersection
      var inner = new Primitive(this.geometry);
      return inner.intersects(primitive);
    }

    warn("Type " + this.type + " to " + primitive.type + " intersection is not supported by intersects");
    return false;
  };


  /*
  GeoJSON Point Class
    new Point();
    new Point(x,y,z,wtf);
    new Point([x,y,z,wtf]);
    new Point([x,y]);
    new Point({
      type: "Point",
      coordinates: [x,y]
    });
  */
  function Point(input){
    var args = Array.prototype.slice.call(arguments);

    if(input && input.type === "Point" && input.coordinates){
      extend(this, input);
    } else if(input && isArray(input)) {
      this.coordinates = input;
    } else if(args.length >= 2) {
      this.coordinates = args;
    } else {
      throw "Terraformer: invalid input for Terraformer.Point";
    }

    this.type = "Point";
  }

  Point.prototype = new Primitive();
  Point.prototype.constructor = Point;

  /*
  GeoJSON MultiPoint Class
      new MultiPoint();
      new MultiPoint([[x,y], [x1,y1]]);
      new MultiPoint({
        type: "MultiPoint",
        coordinates: [x,y]
      });
  */
  function MultiPoint(input){
    if(input && input.type === "MultiPoint" && input.coordinates){
      extend(this, input);
    } else if(isArray(input)) {
      this.coordinates = input;
    } else {
      throw "Terraformer: invalid input for Terraformer.MultiPoint";
    }

    this.type = "MultiPoint";
  }

  MultiPoint.prototype = new Primitive();
  MultiPoint.prototype.constructor = MultiPoint;
  MultiPoint.prototype.forEach = function(func){
    for (var i = 0; i < this.coordinates.length; i++) {
      func.apply(this, [this.coordinates[i], i, this.coordinates]);
    }
    return this;
  };
  MultiPoint.prototype.addPoint = function(point){
    this.coordinates.push(point);
    return this;
  };
  MultiPoint.prototype.insertPoint = function(point, index){
    this.coordinates.splice(index, 0, point);
    return this;
  };
  MultiPoint.prototype.removePoint = function(remove){
    if(typeof remove === "number"){
      this.coordinates.splice(remove, 1);
    } else {
      this.coordinates.splice(this.coordinates.indexOf(remove), 1);
    }
    return this;
  };
  MultiPoint.prototype.get = function(i){
    return new Point(this.coordinates[i]);
  };

  /*
  GeoJSON LineString Class
      new LineString();
      new LineString([[x,y], [x1,y1]]);
      new LineString({
        type: "LineString",
        coordinates: [x,y]
      });
  */
  function LineString(input){
    if(input && input.type === "LineString" && input.coordinates){
      extend(this, input);
    } else if(isArray(input)) {
      this.coordinates = input;
    } else {
      throw "Terraformer: invalid input for Terraformer.LineString";
    }

    this.type = "LineString";
  }

  LineString.prototype = new Primitive();
  LineString.prototype.constructor = LineString;
  LineString.prototype.addVertex = function(point){
    this.coordinates.push(point);
    return this;
  };
  LineString.prototype.insertVertex = function(point, index){
    this.coordinates.splice(index, 0, point);
    return this;
  };
  LineString.prototype.removeVertex = function(remove){
    this.coordinates.splice(remove, 1);
    return this;
  };

  /*
  GeoJSON MultiLineString Class
      new MultiLineString();
      new MultiLineString([ [[x,y], [x1,y1]], [[x2,y2], [x3,y3]] ]);
      new MultiLineString({
        type: "MultiLineString",
        coordinates: [ [[x,y], [x1,y1]], [[x2,y2], [x3,y3]] ]
      });
  */
  function MultiLineString(input){
    if(input && input.type === "MultiLineString" && input.coordinates){
      extend(this, input);
    } else if(isArray(input)) {
      this.coordinates = input;
    } else {
      throw "Terraformer: invalid input for Terraformer.MultiLineString";
    }

    this.type = "MultiLineString";
  }

  MultiLineString.prototype = new Primitive();
  MultiLineString.prototype.constructor = MultiLineString;
  MultiLineString.prototype.forEach = function(func){
    for (var i = 0; i < this.coordinates.length; i++) {
      func.apply(this, [this.coordinates[i], i, this.coordinates ]);
    }
  };
  MultiLineString.prototype.get = function(i){
    return new LineString(this.coordinates[i]);
  };

  /*
  GeoJSON Polygon Class
      new Polygon();
      new Polygon([ [[x,y], [x1,y1], [x2,y2]] ]);
      new Polygon({
        type: "Polygon",
        coordinates: [ [[x,y], [x1,y1], [x2,y2]] ]
      });
  */
  function Polygon(input){
    if(input && input.type === "Polygon" && input.coordinates){
      extend(this, input);
    } else if(isArray(input)) {
      this.coordinates = input;
    } else {
      throw "Terraformer: invalid input for Terraformer.Polygon";
    }

    this.type = "Polygon";
  }

  Polygon.prototype = new Primitive();
  Polygon.prototype.constructor = Polygon;
  Polygon.prototype.addVertex = function(point){
    this.coordinates[0].push(point);
    return this;
  };
  Polygon.prototype.insertVertex = function(point, index){
    this.coordinates[0].splice(index, 0, point);
    return this;
  };
  Polygon.prototype.removeVertex = function(remove){
    this.coordinates[0].splice(remove, 1);
    return this;
  };
  Polygon.prototype.close = function() {
    this.coordinates = closedPolygon(this.coordinates);
  };

  /*
  GeoJSON MultiPolygon Class
      new MultiPolygon();
      new MultiPolygon([ [ [[x,y], [x1,y1]], [[x2,y2], [x3,y3]] ] ]);
      new MultiPolygon({
        type: "MultiPolygon",
        coordinates: [ [ [[x,y], [x1,y1]], [[x2,y2], [x3,y3]] ] ]
      });
  */
  function MultiPolygon(input){
    if(input && input.type === "MultiPolygon" && input.coordinates){
      extend(this, input);
    } else if(isArray(input)) {
      this.coordinates = input;
    } else {
      throw "Terraformer: invalid input for Terraformer.MultiPolygon";
    }

    this.type = "MultiPolygon";
  }

  MultiPolygon.prototype = new Primitive();
  MultiPolygon.prototype.constructor = MultiPolygon;
  MultiPolygon.prototype.forEach = function(func){
    for (var i = 0; i < this.coordinates.length; i++) {
      func.apply(this, [this.coordinates[i], i, this.coordinates ]);
    }
  };
  MultiPolygon.prototype.get = function(i){
    return new Polygon(this.coordinates[i]);
  };
  MultiPolygon.prototype.close = function(){
    var outer = [];
    this.forEach(function(polygon){
      outer.push(closedPolygon(polygon));
    });
    this.coordinates = outer;
    return this;
  };

  /*
  GeoJSON Feature Class
      new Feature();
      new Feature({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [ [ [[x,y], [x1,y1]], [[x2,y2], [x3,y3]] ] ]
        }
      });
      new Feature({
        type: "Polygon",
        coordinates: [ [ [[x,y], [x1,y1]], [[x2,y2], [x3,y3]] ] ]
      });
  */
  function Feature(input){
    if(input && input.type === "Feature"){
      extend(this, input);
    } else if(input && input.type && input.coordinates) {
      this.geometry = input;
    } else {
      throw "Terraformer: invalid input for Terraformer.Feature";
    }

    this.type = "Feature";
  }

  Feature.prototype = new Primitive();
  Feature.prototype.constructor = Feature;

  /*
  GeoJSON FeatureCollection Class
      new FeatureCollection();
      new FeatureCollection([feature, feature1]);
      new FeatureCollection({
        type: "FeatureCollection",
        coordinates: [feature, feature1]
      });
  */
  function FeatureCollection(input){
    if(input && input.type === "FeatureCollection" && input.features){
      extend(this, input);
    } else if(isArray(input)) {
      this.features = input;
    } else {
      throw "Terraformer: invalid input for Terraformer.FeatureCollection";
    }

    this.type = "FeatureCollection";
  }

  FeatureCollection.prototype = new Primitive();
  FeatureCollection.prototype.constructor = FeatureCollection;
  FeatureCollection.prototype.forEach = function(func){
    for (var i = 0; i < this.features.length; i++) {
      func.apply(this, [this.features[i], i, this.features]);
    }
  };
  FeatureCollection.prototype.get = function(id){
    var found;
    this.forEach(function(feature){
      if(feature.id === id){
        found = feature;
      }
    });
    return new Feature(found);
  };

  /*
  GeoJSON GeometryCollection Class
      new GeometryCollection();
      new GeometryCollection([geometry, geometry1]);
      new GeometryCollection({
        type: "GeometryCollection",
        coordinates: [geometry, geometry1]
      });
  */
  function GeometryCollection(input){
    if(input && input.type === "GeometryCollection" && input.geometries){
      extend(this, input);
    } else if(isArray(input)) {
      this.geometries = input;
    } else if(input.coordinates && input.type){
      this.type = "GeometryCollection";
      this.geometries = [input];
    } else {
      throw "Terraformer: invalid input for Terraformer.GeometryCollection";
    }

    this.type = "GeometryCollection";
  }

  GeometryCollection.prototype = new Primitive();
  GeometryCollection.prototype.constructor = GeometryCollection;
  GeometryCollection.prototype.forEach = function(func){
    for (var i = 0; i < this.geometries.length; i++) {
      func.apply(this, [this.geometries[i], i, this.geometries]);
    }
  };
  GeometryCollection.prototype.get = function(i){
    return new Primitive(this.geometries[i]);
  };

  function createCircle(center, radius, interpolate){
    var mercatorPosition = positionToMercator(center);
    var steps = interpolate || 64;
    var polygon = {
      type: "Polygon",
      coordinates: [[]]
    };
    for(var i=1; i<=steps; i++) {
      var radians = i * (360/steps) * Math.PI / 180;
      polygon.coordinates[0].push([mercatorPosition[0] + radius * Math.cos(radians), mercatorPosition[1] + radius * Math.sin(radians)]);
    }
    polygon.coordinates = closedPolygon(polygon.coordinates);

    return toGeographic(polygon);
  }

  function Circle (center, radius, interpolate) {
    var steps = interpolate || 64;
    var rad = radius || 250;

    if(!center || center.length < 2 || !rad || !steps) {
      throw new Error("Terraformer: missing parameter for Terraformer.Circle");
    }

    extend(this, new Feature({
      type: "Feature",
      geometry: createCircle(center, rad, steps),
      properties: {
        radius: rad,
        center: center,
        steps: steps
      }
    }));
  }

  Circle.prototype = new Primitive();
  Circle.prototype.constructor = Circle;
  Circle.prototype.recalculate = function(){
    this.geometry = createCircle(this.properties.center, this.properties.radius, this.properties.steps);
    return this;
  };
  Circle.prototype.center = function(coordinates){
    if(coordinates){
      this.properties.center = coordinates;
      this.recalculate();
    }
    return this.properties.center;
  };
  Circle.prototype.radius = function(radius){
    if(radius){
      this.properties.radius = radius;
      this.recalculate();
    }
    return this.properties.radius;
  };
  Circle.prototype.steps = function(steps){
    if(steps){
      this.properties.steps = steps;
      this.recalculate();
    }
    return this.properties.steps;
  };

  Circle.prototype.toJSON = function() {
    var output = Primitive.prototype.toJSON.call(this);
    return output;
  };

  exports.Primitive = Primitive;
  exports.Point = Point;
  exports.MultiPoint = MultiPoint;
  exports.LineString = LineString;
  exports.MultiLineString = MultiLineString;
  exports.Polygon = Polygon;
  exports.MultiPolygon = MultiPolygon;
  exports.Feature = Feature;
  exports.FeatureCollection = FeatureCollection;
  exports.GeometryCollection = GeometryCollection;
  exports.Circle = Circle;

  exports.toMercator = toMercator;
  exports.toGeographic = toGeographic;

  exports.Tools = {};
  exports.Tools.positionToMercator = positionToMercator;
  exports.Tools.positionToGeographic = positionToGeographic;
  exports.Tools.applyConverter = applyConverter;
  exports.Tools.toMercator = toMercator;
  exports.Tools.toGeographic = toGeographic;
  exports.Tools.createCircle = createCircle;

  exports.Tools.calculateBounds = calculateBounds;
  exports.Tools.calculateEnvelope = calculateEnvelope;

  exports.Tools.coordinatesContainPoint = coordinatesContainPoint;
  exports.Tools.polygonContainsPoint = polygonContainsPoint;
  exports.Tools.arraysIntersectArrays = arraysIntersectArrays;
  exports.Tools.coordinatesContainPoint = coordinatesContainPoint;
  exports.Tools.coordinatesEqual = coordinatesEqual;
  exports.Tools.convexHull = convexHull;
  exports.Tools.isConvex = isConvex;

  exports.MercatorCRS = MercatorCRS;
  exports.GeographicCRS = GeographicCRS;

  return exports;
}));

},{}],2:[function(require,module,exports){
/* globals Terraformer */
(function (root, factory) {

  // Node.
  if(typeof module === 'object' && typeof module.exports === 'object') {
    exports = module.exports = factory(require('terraformer'));
  }

  // Browser Global.
  if(typeof root.navigator === "object") {
    if (!root.Terraformer){
      throw new Error("Terraformer.ArcGIS requires the core Terraformer library. https://github.com/esri/Terraformer");
    }
    root.Terraformer.ArcGIS = factory(root.Terraformer);
  }

}(this, function(Terraformer) {
  var exports = {};

  // https://github.com/Esri/terraformer-arcgis-parser/issues/10
  function decompressGeometry(str) {
    var xDiffPrev = 0;
    var yDiffPrev = 0;
    var points = [];
    var x, y;
    var strings;
    var coefficient;

    // Split the string into an array on the + and - characters
    strings = str.match(/((\+|\-)[^\+\-]+)/g);

    // The first value is the coefficient in base 32
    coefficient = parseInt(strings[0], 32);

    for (var j = 1; j < strings.length; j += 2) {
      // j is the offset for the x value
      // Convert the value from base 32 and add the previous x value
      x = (parseInt(strings[j], 32) + xDiffPrev);
      xDiffPrev = x;

      // j+1 is the offset for the y value
      // Convert the value from base 32 and add the previous y value
      y = (parseInt(strings[j + 1], 32) + yDiffPrev);
      yDiffPrev = y;

      points.push([x / coefficient, y / coefficient]);
    }

    return points;
  }

  // checks if the first and last points of a ring are equal and closes the ring
  function closeRing(coordinates) {
    if (!pointsEqual(coordinates[0], coordinates[coordinates.length - 1])) {
      coordinates.push(coordinates[0]);
    }
    return coordinates;
  }

  // checks if 2 x,y points are equal
  function pointsEqual(a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  // shallow object clone for feature properties and attributes
  // from http://jsperf.com/cloning-an-object/2
  function clone(obj) {
    var target = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        target[i] = obj[i];
      }
    }
    return target;
  }

  // determine if polygon ring coordinates are clockwise. clockwise signifies outer ring, counter-clockwise an inner ring
  // or hole. this logic was found at http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-
  // points-are-in-clockwise-order
  function ringIsClockwise(ringToTest) {
    var total = 0,i = 0;
    var rLength = ringToTest.length;
    var pt1 = ringToTest[i];
    var pt2;
    for (i; i < rLength - 1; i++) {
      pt2 = ringToTest[i + 1];
      total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
      pt1 = pt2;
    }
    return (total >= 0);
  }

  // This function ensures that rings are oriented in the right directions
  // outer rings are clockwise, holes are counterclockwise
  function orientRings(poly){
    var output = [];
    var polygon = poly.slice(0);
    var outerRing = closeRing(polygon.shift().slice(0));
    if(outerRing.length >= 4){
      if(!ringIsClockwise(outerRing)){
        outerRing.reverse();
      }

      output.push(outerRing);

      for (var i = 0; i < polygon.length; i++) {
        var hole = closeRing(polygon[i].slice(0));
        if(hole.length >= 4){
          if(ringIsClockwise(hole)){
            hole.reverse();
          }
          output.push(hole);
        }
      }
    }

    return output;
  }

  // This function flattens holes in multipolygons to one array of polygons
  // [
  //   [
  //     [ array of outer coordinates ]
  //     [ hole coordinates ]
  //     [ hole coordinates ]
  //   ],
  //   [
  //     [ array of outer coordinates ]
  //     [ hole coordinates ]
  //     [ hole coordinates ]
  //   ],
  // ]
  // becomes
  // [
  //   [ array of outer coordinates ]
  //   [ hole coordinates ]
  //   [ hole coordinates ]
  //   [ array of outer coordinates ]
  //   [ hole coordinates ]
  //   [ hole coordinates ]
  // ]
  function flattenMultiPolygonRings(rings){
    var output = [];
    for (var i = 0; i < rings.length; i++) {
      var polygon = orientRings(rings[i]);
      for (var x = polygon.length - 1; x >= 0; x--) {
        var ring = polygon[x].slice(0);
        output.push(ring);
      }
    }
    return output;
  }

  function coordinatesContainCoordinates(outer, inner){
    var intersects = Terraformer.Tools.arraysIntersectArrays(outer, inner);
    var contains = Terraformer.Tools.coordinatesContainPoint(outer, inner[0]);
    if(!intersects && contains){
      return true;
    }
    return false;
  }

  // do any polygons in this array contain any other polygons in this array?
  // used for checking for holes in arcgis rings
  function convertRingsToGeoJSON(rings){
    var outerRings = [];
    var holes = [];

    // for each ring
    for (var r = 0; r < rings.length; r++) {
      var ring = closeRing(rings[r].slice(0));
      if(ring.length < 4){
        continue;
      }
      // is this ring an outer ring? is it clockwise?
      if(ringIsClockwise(ring)){
        var polygon = [ ring ];
        outerRings.push(polygon); // push to outer rings
      } else {
        holes.push(ring); // counterclockwise push to holes
      }
    }

    // while there are holes left...
    while(holes.length){
      // pop a hole off out stack
      var hole = holes.pop();
      var matched = false;

      // loop over all outer rings and see if they contain our hole.
      for (var x = outerRings.length - 1; x >= 0; x--) {
        var outerRing = outerRings[x][0];
        if(coordinatesContainCoordinates(outerRing, hole)){
          // the hole is contained push it into our polygon
          outerRings[x].push(hole);

          // we matched the hole
          matched = true;

          // stop checking to see if other outer rings contian this hole
          break;
        }
      }

      // no outer rings contain this hole turn it into and outer ring (reverse it)
      if(!matched){
        outerRings.push([ hole.reverse() ]);
      }
    }

    if(outerRings.length === 1){
      return {
        type: "Polygon",
        coordinates: outerRings[0]
      };
    } else {
      return {
        type: "MultiPolygon",
        coordinates: outerRings
      };
    }
  }

  // ArcGIS -> GeoJSON
  function parse(arcgis, options){
    var geojson = {};

    options = options || {};
    options.idAttribute = options.idAttribute || undefined;

    if(typeof arcgis.x === 'number' && typeof arcgis.y === 'number'){
      geojson.type = "Point";
      geojson.coordinates = [arcgis.x, arcgis.y];
      if (arcgis.z || arcgis.m){
        geojson.coordinates.push(arcgis.z);
      }
      if (arcgis.m){
        geojson.coordinates.push(arcgis.m);
      }
    }

    if(arcgis.points){
      geojson.type = "MultiPoint";
      geojson.coordinates = arcgis.points.slice(0);
    }

    if(arcgis.paths) {
      if(arcgis.paths.length === 1){
        geojson.type = "LineString";
        geojson.coordinates = arcgis.paths[0].slice(0);
      } else {
        geojson.type = "MultiLineString";
        geojson.coordinates = arcgis.paths.slice(0);
      }
    }

    if(arcgis.rings) {
      geojson = convertRingsToGeoJSON(arcgis.rings.slice(0));
    }

    if(arcgis.compressedGeometry || arcgis.geometry || arcgis.attributes) {
      geojson.type = "Feature";

      if(arcgis.compressedGeometry){
        arcgis.geometry = {
          paths: [
            decompressGeometry(arcgis.compressedGeometry)
          ]
        };
      }

      geojson.geometry = (arcgis.geometry) ? parse(arcgis.geometry) : null;
      geojson.properties = (arcgis.attributes) ? clone(arcgis.attributes) : null;
      if(arcgis.attributes) {
        geojson.id =  arcgis.attributes[options.idAttribute] || arcgis.attributes.OBJECTID || arcgis.attributes.FID;
      }
    }

    var inputSpatialReference = (arcgis.geometry) ? arcgis.geometry.spatialReference : arcgis.spatialReference;

    //convert spatial ref if needed
    if(inputSpatialReference && inputSpatialReference.wkid === 102100){
      geojson = Terraformer.toGeographic(geojson);
    }

    return new Terraformer.Primitive(geojson);
  }

  // GeoJSON -> ArcGIS
  function convert(geojson, options){
    var spatialReference;

    options = options || {};
    var idAttribute = options.idAttribute || "OBJECTID";

    if(options.sr){
      spatialReference = { wkid: options.sr };
    } else if (geojson && geojson.crs === Terraformer.MercatorCRS) {
      spatialReference = { wkid: 102100 };
    } else {
      spatialReference = { wkid: 4326 };
    }

    var result = {};
    var i;

    switch(geojson.type){
    case "Point":
      result.x = geojson.coordinates[0];
      result.y = geojson.coordinates[1];
      if(geojson.coordinates[2]) {
        result.z = geojson.coordinates[2];
      }
      if(geojson.coordinates[3]) {
        result.m = geojson.coordinates[3];
      }
      result.spatialReference = spatialReference;
      break;
    case "MultiPoint":
      result.points = geojson.coordinates.slice(0);
      result.spatialReference = spatialReference;
      break;
    case "LineString":
      result.paths = [geojson.coordinates.slice(0)];
      result.spatialReference = spatialReference;
      break;
    case "MultiLineString":
      result.paths = geojson.coordinates.slice(0);
      result.spatialReference = spatialReference;
      break;
    case "Polygon":
      result.rings = orientRings(geojson.coordinates.slice(0));
      result.spatialReference = spatialReference;
      break;
    case "MultiPolygon":
      result.rings = flattenMultiPolygonRings(geojson.coordinates.slice(0));
      result.spatialReference = spatialReference;
      break;
    case "Feature":
      if(geojson.geometry) {
        result.geometry = convert(geojson.geometry, options);
      }
      result.attributes = (geojson.properties) ? clone(geojson.properties) : {};
      result.attributes[idAttribute] = geojson.id;
      break;
    case "FeatureCollection":
      result = [];
      for (i = 0; i < geojson.features.length; i++){
        result.push(convert(geojson.features[i], options));
      }
      break;
    case "GeometryCollection":
      result = [];
      for (i = 0; i < geojson.geometries.length; i++){
        result.push(convert(geojson.geometries[i], options));
      }
      break;
    }

    return result;
  }

  function parseCompressedGeometry(string){
    return new Terraformer.LineString(decompressGeometry(string));
  }

  exports.parse   = parse;
  exports.convert = convert;
  exports.toGeoJSON = parse;
  exports.fromGeoJSON = convert;
  exports.parseCompressedGeometry = parseCompressedGeometry;

  return exports;
}));

},{"terraformer":1}],3:[function(require,module,exports){

// modified from https://github.com/rndme/download
// data can be a string, Blob, File, or dataURL

module.exports = function (data, strFileName, strMimeType) {
	
	var self = window, // this script is only for browsers anyway...
		u = "application/octet-stream", // this default mime also triggers iframe downloads
		m = strMimeType || u, 
		x = data,
		D = document,
		a = D.createElement("a"),
		z = function(a){return String(a);},
		B = (self.Blob || self.MozBlob || self.WebKitBlob || z);
		B=B.call ? B.bind(self) : Blob ;
		var fn = strFileName || "download",
		blob, 
		fr;

	
	if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
		x=[x, m];
		m=x[0];
		x=x[1]; 
	}
	
	


	//go ahead and download dataURLs right away
	if(String(x).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/)){
		return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
			navigator.msSaveBlob(d2b(x), fn) : 
			saver(x) ; // everyone else can save dataURLs un-processed
	}//end if dataURL passed?
	
	blob = x instanceof B ? 
		x : 
		new B([x], {type: m}) ;
	
	
	function d2b(u) {
		var p= u.split(/[:;,]/),
		t= p[1],
		dec= p[2] == "base64" ? atob : decodeURIComponent,
		bin= dec(p.pop()),
		mx= bin.length,
		i= 0,
		uia= new Uint8Array(mx);

		for(i;i<mx;++i) uia[i]= bin.charCodeAt(i);

		return new B([uia], {type: t});
	 }
	  
	function saver(url, winMode){
		
		if ('download' in a) { //html5 A[download] 			
			a.href = url;
			a.setAttribute("download", fn);
			a.innerHTML = "downloading...";
			D.body.appendChild(a);
			setTimeout(function() {
				a.click();
				D.body.removeChild(a);
				if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(a.href);}, 250 );}
			}, 66);
			return true;
		}

		if(typeof safari !=="undefined" ){ // handle non-a[download] safari as best we can:
			url="data:"+url.replace(/^data:([\w\/\-\+]+)/, u);
			if(!window.open(url)){ // popup blocked, offer direct download: 
				if(confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")){ location.href=url; }
			}
			return true;
		}
		
		//do iframe dataURL download (old ch+FF):
		var f = D.createElement("iframe");
		D.body.appendChild(f);
		
		if(!winMode){ // force a mime that will download:
			url="data:"+url.replace(/^data:([\w\/\-\+]+)/, u);
		}
		f.src=url;
		setTimeout(function(){ D.body.removeChild(f); }, 333);
		
	}//end saver 
		



	if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
		return navigator.msSaveBlob(blob, fn);
	} 	
	
	if(self.URL){ // simple fast and modern way using Blob and URL:
		saver(self.URL.createObjectURL(blob), true);
	}else{
		// handle non-Blob()+non-URL browsers:
		if(typeof blob === "string" || blob.constructor===z ){
			try{
				return saver( "data:" +  m   + ";base64,"  +  self.btoa(blob)  ); 
			}catch(y){
				return saver( "data:" +  m   + "," + encodeURIComponent(blob)  ); 
			}
		}
		
		// Blob but not URL:
		fr=new FileReader();
		fr.onload=function(e){
			saver(this.result); 
		};
		fr.readAsDataURL(blob);
	}	
	return true;
} /* end download() */
},{}],4:[function(require,module,exports){
var download = require('./download.js');
var openPost = require('./openPost.js');
var ArcGIS = require('terraformer-arcgis-parser')

module.exports = function(vecSrc){
        
        if( !(vecSrc && vecSrc.getFeatures().length) ){ return; }
        
        var lst = document.getElementById("dataList");
        var laagName = lst.options[lst.selectedIndex].text;
        
        var crslst = document.getElementById("crsList");
        var outSRS = crslst.options[crslst.selectedIndex].value;
        
        if( document.getElementById('geoJsonChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                  {dataProjection: outSRS, featureProjection:'EPSG:31370'});
            download( gjs, laagName +".geojson" , "text/plain");
        }
        else if( document.getElementById('shpChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                  {dataProjection: 'EPSG:4326', featureProjection:'EPSG:31370'});       
            openPost('POST', "http://ogre.adc4gis.com/convertJson", { json: gjs, outputName: laagName +".zip"}, "_blank")
        }
        else if( document.getElementById('gpxChk').checked ){
            var ftype = vecSrc.getFeatures()[0].getGeometry().getType();
            if(ftype == "MultiPolygon" || ftype == "Polygon"){
                alert("GPX kan enkel lijnen en punten opslaan");
            }
            else {
                var gpxParser = new ol.format.GPX();
                var gpx = gpxParser.writeFeatures( vecSrc.getFeatures(),
                                        { dataProjection:'EPSG:4326', featureProjection:'EPSG:31370'});
                download( gpx, laagName +".gpx" , "text/plain");
            }
        }
        else if( document.getElementById('esriJSChk').checked ){
            var gjsParser = new ol.format.GeoJSON();
            var gjs = JSON.parse( gjsParser.writeFeatures( vecSrc.getFeatures(), 
                                        {dataProjection: outSRS, featureProjection:'EPSG:31370'} ));
            
            var arcjs =  ArcGIS.convert( gjs );
            
            var esriGeometry;
            var ftype = gjs.features[0].geometry.type;
            switch(ftype) {
                case "Point":
                    esriGeometry = "esriGeometryPoint";
                    break;
                case "LineString":
                    esriGeometry = "esriGeometryPolyline";
                    break;
                case "MultiLineString":
                    esriGeometry = "esriGeometryPolyline";
                    break;
                case "MultiPoint":
                    esriGeometry = "esriGeometryMultipoint";
                    break;
                case "Polygon":
                    esriGeometry = "esriGeometryPolygon";                
                    break;          
                case "MultiPolygon":
                    esriGeometry = "esriGeometryPolygon";
                    break;                
                default:
                    esriGeometry = null;
            }
            var esriFields = [] ;
            for( var key in gjs.features[0].properties ){ 
                if ( key.toLowerCase() == "objectid") { continue; }
                
                feat = gjs.features[0].properties[key];
                if( typeof(feat) == "number" ){ 
                    esriFields.push({name:key, type:"esriFieldTypeDouble" }) 
                }
                else {
                    esriFields.push({name:key, type:"esriFieldTypeString", length: 254 }) 
                }
            }
                    
            for( var i= 0; i < arcjs.length; i++ ){
                delete arcjs[i].geometry.spatialReference  //remove wrong prj
                delete arcjs[i].attributes.objectid  //can't have 2 objectID 's
            }
            latestWkid = parseInt(outSRS.replace("EPSG:",""));
            wkid = latestWkid;
            if( latestWkid = 3857 ){  wkid = 102100 }
            
            var arcjsFull = { 
                spatialReference : { wkid: wkid,
                                     latestWkid: latestWkid } ,
                fields: esriFields,
                geometryType: esriGeometry,
                features: arcjs 
            }                   
            download( JSON.stringify(arcjsFull), laagName +".json" , "text/plain");
        }
    }

},{"./download.js":3,"./openPost.js":10,"terraformer-arcgis-parser":2}],5:[function(require,module,exports){

module.exports = function geocoder( geocoderInputID, map , featureOverlay){
    var marker;
    
    $( "#"+ geocoderInputID ).autocomplete({
    source: function( request, response ) {
    $.ajax({
        url: "http://loc.api.geopunt.be/geolocation/Suggestion",
        dataType: "jsonp",
        data: {
            q: request.term + ", Antwerpen",
            c: 20
        },
        success: function( data ) {
        var straten = [];
        $.each( data.SuggestionResult, function( index, value ){
                var straat = value.substring( 0, value.lastIndexOf(",")).trim() ;
                if( straat != "" ){
                    straten.push( straat );
                }
            });
        //filter dubplicates
        straten = straten.filter(function(elem, pos) {
            return straten.indexOf(elem) == pos;
        });
        response( straten );
        }
      });
    },
    minLength: 2,
    select: function( event, ui ) {
        var adres = ui.item.label;
        
        $.ajax({
            url: "http://loc.api.geopunt.be/geolocation/Location",
            dataType: "jsonp",
            data: {
            q: adres + ", Antwerpen",
            c: 1
        },
        success: function( data ) {
        var locs = data.LocationResult;
        if( locs.length ){
            var loc = locs[0];
            var coordinates = [loc.Location.X_Lambert72, loc.Location.Y_Lambert72];
            
            if(marker){ featureOverlay.removeFeature(marker); }
            marker = new ol.Feature({
                geometry: new ol.geom.Point(coordinates), 
                name: loc.FormattedAddress
                });

            featureOverlay.addFeature(marker);       
            
            var view= map.getView();
            view.fitExtent([loc.BoundingBox.LowerLeft.X_Lambert72, 
                            loc.BoundingBox.LowerLeft.Y_Lambert72, 
                            loc.BoundingBox.UpperRight.X_Lambert72,
                            loc.BoundingBox.UpperRight.Y_Lambert72],  map.getSize()) 
            }
          },
         complete: function(data) {
             $('#adres').val(''); //clear input when finished
         }
        })
      },
    });
    
}
},{}],6:[function(require,module,exports){
var geocoder = require('./geocoder.js');
var mapObj = require('./map.js');
var mapEvents = require('./mapEvents.js');
var initUI = require('./ui.js');

$( document ).ready(function() {

    /*proj4 defs*/
    proj4.defs("EPSG:31370","+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.869,52.2978,-103.724,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs");
    proj4.defs("EPSG:32631","+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:3812","+proj=lcc +lat_1=49.83333333333334 +lat_2=51.16666666666666 +lat_0=50.797815 +lon_0=4.359215833333333 +x_0=649328 +y_0=665262 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        
    var kaart = new mapObj('map');
    var kaartEvent = new mapEvents( kaart.map, kaart.vectorLayer, kaart.featureOverlay);
    var ui = new initUI( kaart.map , kaart.vectorLayer , kaart.featureOverlay);
    var adresFinder = new geocoder( 'adres', kaart.map , kaart.featureOverlay );
    
});



},{"./geocoder.js":5,"./map.js":7,"./mapEvents.js":8,"./ui.js":11}],7:[function(require,module,exports){

module.exports = function MapObj( mapID ){
    var styles = {
        'Point': [new ol.style.Style({
            image: new ol.style.Circle({
                        radius: 5, 
                        fill: new ol.style.Fill({ color: 'rgba(255, 255, 0, 0.5)'}),
                        stroke: new ol.style.Stroke({color: 'yellow', width: 1})
                    })
                })],
        'LineString': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
            })],
        'MultiLineString': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
        })],
        'MultiPoint': [new ol.style.Style({
            image: new ol.style.Circle({
                    radius: 5, 
                    fill: new ol.style.Fill({ color: 'rgba(255, 255, 0, 0.5)'}),
                    stroke: new ol.style.Stroke({color: 'yellow', width: 1})
                }),
            })],
        'MultiPolygon': [new ol.style.Style({
            stroke: new ol.style.Stroke({
                    color: 'yellow',
                    width: 2
                }),
            fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, 0.1)'
            })
        })],
        'Polygon': [new ol.style.Style({
            stroke: new ol.style.Stroke({
            color: 'yellow',
            width: 2
            }),
            fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, 0.1)'
            })
        })]
        };
    
    this.styleFunction = function(feature, resolution) {
            return styles[feature.getGeometry().getType()];
        }
    
    this.vectorLayer = new ol.layer.Vector({style: this.styleFunction}) ;   
    
    /*basiskaart*/ 
    var projectionExtent = [9928.00, 66928.00, 272072.00, 329072.00];
    var projection = ol.proj.get('EPSG:31370');
    projection.setExtent(projectionExtent);
    var size = ol.extent.getWidth(projectionExtent) / 256;
    var resolutions = new Array(16);
    var matrixIds = new Array(16);
    for (var z = 0; z < 16; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
    }

    this.basiskaart = new ol.layer.Tile({
        extent: projectionExtent,
        source: new ol.source.WMTS({
          attributions: [new ol.Attribution({ html: 
                   'Door <a href="mailto:kaywarrie@gmail.com">Kay Warie</a>, Basiskaart door: <a href="http://www.agiv.be/" target="_blank">AGIV</a>' }) ],
          url: 'http://grb.agiv.be/geodiensten/raadpleegdiensten/geocache/wmts/',
          layer: 'grb_bsk_gr',
          matrixSet: 'BPL72VL',
          format: 'image/png',
          projection: projection,
          tileGrid: new ol.tilegrid.WMTS({
               origin: ol.extent.getTopLeft(projectionExtent),
               resolutions: resolutions,
               matrixIds: matrixIds
            })
        })
    }); 

    this.map = new ol.Map({
            target: mapID,
//             logo: null,
            layers: [ this.basiskaart, this.vectorLayer  ],
            view: new ol.View({
                projection: 'EPSG:31370',
                center: [152223, 213544],
                extent: projectionExtent,              
                zoom: 4,
                maxZoom: 16
            })
        });
    this.map.addControl(new ol.control.ScaleLine());

    this.featureOverlay = new ol.FeatureOverlay({
        map: this.map,
        style:  new ol.style.Style({
            image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({color: 'red', width: 1})
                }),
            stroke: new ol.style.Stroke({
                    color: '#f00',
                    width: 1
                }),
            fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,0.1)'
                }),
            })       
    });           
}

},{}],8:[function(require,module,exports){

module.exports = function mapEvents( map, vectorLayer, featureOverlay ){
    
    var dlg = $( "#info" ).dialog({ autoOpen: false });
    var highlight;
    /*event handlers*/
    this.displayFeatureInfo = function(pixel, map) {
        var vfeature, vlayer; 
        map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            vfeature = feature;
            vlayer = layer;
        });
        if (vfeature && vlayer == vectorLayer ) {
            var props = vfeature.getProperties();
            delete props.geometry;
            
            var msg = "";
            
            for(var key in props) {
                    msg += "<strong>"+ key + ":</strong> "+ props[ key ] +"<br/>";
                }
            var lst = document.getElementById("dataList")
            var laagName = lst.options[lst.selectedIndex].text;

            dlg.html(msg);
            dlg.dialog( "option", "title", laagName).dialog( "open" );   
        
            if (vfeature !== highlight) {
                if (highlight) {
                        featureOverlay.removeFeature(highlight);
                    }
                if (vfeature) {
                        featureOverlay.addFeature(vfeature);
                    }
                    highlight = vfeature;
                } 
            } 
    }
    
    /*events*/
    var displayFeatureInfo = this.displayFeatureInfo;
    map.on('click', function(evt) {
        displayFeatureInfo(evt.pixel, map);
    });
    
    dlg.on( "dialogclose", function( event, ui ) {
          if (highlight) {
                featureOverlay.removeFeature(highlight);
                highlight = null;
          } 
    });
    
}   

},{}],9:[function(require,module,exports){
module.exports = function(data){
        var gjsParser = new ol.format.GeoJSON();
        var features =  [];
        for ( var i = 0; i < data.length; ++i ){
            var item = data[i];
            var geometry;
            if( item.point_lat && item.point_lng ) {
                var coords = ol.proj.transform(
                        [parseFloat(item.point_lng), parseFloat(item.point_lat)],'EPSG:4326','EPSG:31370')
                geometry= new ol.geom.Point( coords );
                delete item.point_lng;
                delete item.point_lat;
                }
            else if( item.geometry ) {
                try{
                geometry = gjsParser.readGeometry( item.geometry, {
                                    featureProjection:'EPSG:31370', dataProjection:'EPSG:4326'});            
                }
                catch(ero) {
                    console.log("Kon geometry op record "+ item.id + " niet parseren" )
                }
                delete item.geometry;
                delete item.objectid; //obsolete
            }
            else { 
                throw 'Niet alle records geografisch'; 
            }
            item.geometry = geometry ;
            var feature = new ol.Feature(item);
            features.push( feature );
        }
        return features;
    }
},{}],10:[function(require,module,exports){

module.exports = function(verb, url, data, target) {
  var form = document.createElement("form");
  form.action = url;
  form.method = verb;
  form.target = target || "_self";
  if (data) {
    for (var key in data) {
      var input = document.createElement("textarea");
      input.name = key;
      input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
      form.appendChild(input);
    }
  }
  form.style.display = 'none';
  document.body.appendChild(form);
  form.submit();
};
},{}],11:[function(require,module,exports){
    
var od2olParser = require('./od2ol3parser.js')
var downloadEvent = require('./downloadEvent.js');

module.exports = function( map, vectorLayer, featureOverlay ){
    var dlg = $( "#info" ).dialog({ autoOpen: false });
    
    var downloadDlg = $( "#downloadDlg" ).dialog({ 
        autoOpen: false,
        height:340,
        width: 400,
        modal: true,
        buttons: {
            "Download Data": function() {
                downloadEvent( vectorLayer.getSource() ); 
                $( this ).dialog( "close" );
            },
            "Cancel": function() {
                $( this ).dialog( "close" );
            }
       }     
    });
    $( "#toolbar" ).tooltip();
    $( "#saveBtn" ).button();
    $( "#saveOpenBtn" ).button();
    $( "#infoBtn" ).button();
    
    $.ajax({ url: "index.json" })
    .done( function(resp)  {
            $.each(resp , function(i, elem)
            {
                var title = elem.title;
                var ds = elem.ds;
                var info = elem.info;
                var url = elem.url;
                $( "#dataList" ).append($("<option></option>")
                      .attr("data-url", url)
                      .attr("data-info", info)
                      .attr("value", ds).text(title));                                
            })         
        })
    .fail( function(ero) {
        console.log(ero);
        alert("Sorry. Server gaf fout, de lagen werden niet geladen.");
    });
      
     $( "#infoBtn" ).click(function(){
         var lst = document.getElementById("dataList");
         var laagName = lst.options[lst.selectedIndex].text;
         if( laagName == "" ){return;}
         var laagInfo = $(lst.options[lst.selectedIndex]).attr( "data-info" );
         var laagUrl =  $(lst.options[lst.selectedIndex]).attr( "data-url" );
         var msg = "<p>"+ laagInfo +"</p><a target='_blank' href='"+ laagUrl +"'>Meer Info</a>";
         dlg.html(msg);
         dlg.dialog( "option", "title", laagName).dialog( "open" );   
    });
    
//     $.ajax({ url: "http://datasets.antwerpen.be/v4/gis.json" })
//     .done( function(resp)  {
//             var indexJson = resp.data.datasets;             
//             $.each(indexJson , function(i, elem)
//             {
//                 var title = elem.split("/").slice(-1)[0];              
//                 $( "#dataList" ).append($("<option></option>")
//                                 .attr("value", elem).text(title));                                
//             })         
//         })
//     .fail( function(ero) {
//         console.log(ero);
//         alert("Sorry. Server gaf fout, de lagen werden niet geladen.")});
    
    $('#dataList').change(function() {
            var pageUrl =  this.options[this.selectedIndex].value;
            displayData(pageUrl + ".json");
            });

    $( "#saveOpenBtn" ).click(function(){
        if(!(vectorLayer.getSource() && vectorLayer.getSource().getFeatures().length) ){ 
            alert("Er is geen data om te downloaden")
            return; } 
         downloadDlg.dialog( "open" );   
    });
    
    /*event handlers*/        
    var vectorSource = new ol.source.Vector({projection: 'EPSG:31370'});
    vectorLayer.setSource(vectorSource); 
    
    var displayData = function( url ) { 
        vectorSource.clear(1)
        $.ajax({ url: url, dataType: 'json'}).done(function(resp) {
            var pages = resp.paging.pages 
            var features = od2olParser(resp.data);
            vectorSource.addFeatures(features);
            
            for ( var i = 2; i <= pages; ++i ){ 
                $.ajax({url: url +"?page="+ i , dataType: 'json'}).done(function(resp2) {
                    var features = od2olParser(resp2.data);
                    vectorSource.addFeatures(features);
                });
            }
        });     
    }

      
}
},{"./downloadEvent.js":4,"./od2ol3parser.js":9}]},{},[6]);
