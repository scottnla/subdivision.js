/* Example! */

function testConvexHull2D(geo) {
    geo.addVertex(a);
    geo.addVertex(b);
    geo.addVertex(c);
    geo.addVertex(d);
    geo.addVertex(e);
    geo.addVertex(f);
    var hull = geo.jarvisMarch();
    console.log(hull);
}

geo = new GeometryManager();
a = new Vertex(0,-5);
b = new Vertex(0,5);
c = new Vertex(5,10);
d = new Vertex(5,-10);
e = new Vertex(-5,10);
f = new Vertex(-5,-10);
testConvexHull2D();