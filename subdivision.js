/*
 * subdivision.js
 * author: nathan lachenmyer <scottnla AT mit DOT edu>
 * last updated: 2013 March 13
 * version: 0.1
 * 
 * A javascript library for computational geometry.
 */

//input data 
function Vertex(_x, _y) {
    this.x = _x;
    this.y = _y;
}

function Edge(_vertexA, _vertexB) {
    this.a = _vertexA;
    this.b = _vertexB;
}

function Face() {
    this.vertices = [];
    this.centroid = null;
}

Face.prototype.addVertex = function(_vertex) {
    this.vertices.push(_vertex);
}

Face.prototype.computeCentroid = function() {
    /*
     * Compute the centroid of the face by averaging the position of all vertices.
     */
    var numVertices = this.vertices.length;
    var centroid_x = 0;
    var centroid_y = 0;
    for(var i = 0; i < numVertices; i++) {
	//compute the centroid
	centroid_x += this.vertices[i].x;
	centroid_y += this.vertices[i].y;
    }
    centroid_x /= numVertices;
    centroid_y /= numVertices;
    this.centroid = new Vertex(centroid_x, centroid_y);
    return this.centroid
}

Face.prototype.sortVertices = function() {
    /*
     * Sort the vertices in counterclockwise order relative to the centroid.  The centroid is automatically updated by this call, so there's no need to manually run it after adding new vertices.
     */
    this.computeCentroid();
    var angleList = [];
    for(var i = 0; i < this.vertices.length; i++) {
	//An extra PI is added to ensure all angles are positive.  This makes comparison a bit easier.
	var angleFromCentroid = Math.atan2(this.vertices[i].y - this.centroid.y, this.vertices[i].x - this.centroid.x) + Math.PI;
	//create a pair of vertex-angle objects for sorting
	angleList.push([this.vertices[i], angleFromCentroid]);
    }
    angleList.sort(function(a,b) {return a[1] - b[1];});
    for(var i = 0; i < this.vertices.length; i++) {
	this.vertices[i] = angleList[i][0];
    }
}

function HalfEdge(_vertex) {
    this.origin = _vertex;
    this.face = null;
    this.twin = null;
    this.next = null;
    this.nextVertex = null;
    this.prev = null;
}

function GeometryManager() {
    /*
     * A class that manages the global vertex / edge / face space, subdivision, etc.
     * This stores data as a doubly-conneted edge list.
     */
    this.faces = [];
    this.vertices = [];
    this.halfedges = [];
}

GeometryManager.prototype.addVertex = function(_vertex) {
    this.vertices.push(_vertex);
}

GeometryManager.prototype.makeEdges = function(faceList) {
    /*
     * Creates the half-edge data structure from a list of vertices and faces.
     */
    for(var i = 0; i < faceList.length; i++) {
	var face = faceList[i];
	//sort the vertices so we know their ordering (and therefore, implicitly, the edges).
	face.sortVertices();
	//for each vertex create a half-edge
	for(var j = 0; j < face.vertices.length; j++) {
	    var newEdge = new HalfEdge(face.vertices[j]);
	    newEdge.face = face;
	    newEdge.nextVertex = face.vertices[(j+1) % face.vertices.length];
	    this.halfedges.push(newEdge);
	}
    }
    //all half-edges should have been created.  Now we investigate looking for previous, twin, and next pointers.
    for(var i = 0; i < this.halfedges.length; i++) {
	for(var j = 0; j < this.halfedges.length; j++) {
	    //check if the two edges are neighbors; they share a face and are neighbors
	    if(this.halfedges[i].nextVertex == this.halfedges[j].origin && this.halfedges[i].face == this.halfedges[j].face) {
		this.halfedges[i].next = this.halfedges[j];
		this.halfedges[j].prev = this.halfedges[i];
	    }
	    //check if the two edges are twins; they won't share a face
	    if(this.halfedges[i].nextVertex == this.halfedges[j].origin && this.halfedges[i].face != this.halfedges[j].face) {
		this.halfedges[i].twin = this.halfedges[j];
		this.halfedges[j].twin = this.halfedges[i];
	    }
	}
    }
}

GeometryManager.prototype.isLeft = function(vertex0, vertex1, vertex2) {
    /*
     * Computed using the determinant method.
     */
    var determinant = vertex0.x*vertex1.y + vertex1.x*vertex2.y + vertex2.x*vertex0.y - vertex2.x*vertex1.y - vertex1.x*vertex0.y - vertex0.x*vertex2.y;
    if(determinant > 0) {
	return true;
    }
    else {
	return false;
    }
}

GeometryManager.prototype.jarvisMarch = function() {
    /*
     * Uses Jarvis' March to compute the convex hull.
     */

    //create a list of holding the points on the hull
    var pointsOnHull = [];
    pointsOnHull.push(this.vertices[0]);

    //compute the leftmost point; this is our initial point for computing the convex hull.
    for(var i = 1; i < this.vertices.length; i++) {
	if(this.vertices[i].x < pointsOnHull[0].x) {
	    pointsOnHull[0] = this.vertices[i];	    
	}
    }

    console.log("Initial Point found!");
    console.log(pointsOnHull);

    //begin march
    for(var i = 0; i < pointsOnHull.length - 1; i++) {
	var p = pointsOnHull[i];
	var q = nextHullPoint(this.vertices, p);
	if (q != pointsOnHull[0]) {
	    pointsOnHull.append(q);
	}
    }

    function nextHullPoint(_vertices, currentPoint) {
	/*
	 * Returns the next point on the convex hull
	 */
	console.log("Vertices: " + _vertices);
	var q = currentPoint;
	for(var j = 0; j < _vertices.length - 1; j++) {
	    var r = vertices[j];
	    if(!this.isLeft(currentPoint, q, r)) {
		q = r;
	    }
	}
	return q;
    }

    return pointsOnHull;
}

function testConvexHull2D() {
    geo = new GeometryManager();
    a = new Vertex(0,-5);
    b = new Vertex(0,5);
    c = new Vertex(5,10);
    d = new Vertex(5,-10);
    e = new Vertex(-5,10);
    f = new Vertex(-5,-10);
    geo.addVertex(a);
    geo.addVertex(b);
    geo.addVertex(c);
    geo.addVertex(d);
    geo.addVertex(e);
    geo.addVertex(f);
    var hull = geo.jarvisMarch();
    console.log(hull);
}