
var width = 1600,
  height = 1300,
  pad = 20,
  scale = .3,
  zoomWidth = (width-scale*width)/2,
  zoomHeight = (height-scale*height)/2,
  root;

var force = cola.d3adaptor()
  .linkDistance(400)
  .size([width, height])
  .avoidOverlaps(true)
// d3.layout.force()
//   .size([width, height])
//   .charge(-500)
//   .gravity(.05)
//   .linkDistance(500)
  .on("tick", tick);

var zoom = d3.behavior.zoom()
  .scaleExtent([0.01,10])
  .translate([zoomWidth, zoomHeight])
  .scale(scale)
  .on("zoom", zoomed);  

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(zoom)
  .append("g")
  .attr("transform", "translate(" + zoomWidth + "," + zoomHeight + ") scale(" + scale + ")");


var link = svg.selectAll(".link"),
  node = svg.selectAll("g.node");

d3.json("testd3dataNoSalesDept.json", function (error, json) {
  if (error) throw error;

  root = json;
  var nodes = flatten(root);
  console.log(nodes);
  for (let i = 0; i < nodes.length; i++) {
    // if (i < 23323) {
      const d = nodes[i];
      d._children = d.children;
      d.children = null;
    // }
  }

  update();
});

function update() {
  var nodes = flatten(root),
    links = d3.layout.tree().links(nodes);
    
  // Restart the force layout.
  force
    .nodes(nodes)
    .links(links)
    .start(40,0,10);

  // Update the links…
  link = link.data(links, function (d) { return d.target.id; });

  // Exit any old links.
  link.exit().remove();

  // Enter any new links.
  link.enter().insert("line", ".node")
    .attr("class", "link")
    .attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d) { return d.target.x; })
    .attr("y2", function (d) { return d.target.y; });

  // Update the nodes…
  node = node.data(nodes, function (d) { return d.id; });
  
  // Exit any old nodes.
  node.exit().remove();

  // Enter any new nodes.
  var nodeEnter = node.enter().append("svg:g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    .on("click", click)
    .call(force.drag);

  // Append a circle
  nodeEnter.append("svg:circle")
    .attr("r", function (d) { return Math.sqrt(100*100 *2); })
    .style("fill", "#eee");


  // Append images
  nodeEnter.append("svg:image")
    .attr("xlink:href", function (d) { return d.img || "product-images/missing-item.jpg"; })
    .attr("x", function (d) { return -100; })
    .attr("y", function (d) { return -100; })
    .attr("height", 200)
    .attr("width", 200);
  
  // Append titles 


}

function tick() {
  link.attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d) { return d.target.x; })
    .attr("y2", function (d) { return d.target.y; });

  node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

function zoomed() {
  svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

// Toggle children on click.
function click(d) {
  console.log(d);
  if (!d3.event.defaultPrevented) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
      d.fixed = true; 
    }
    update();
  }
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++i;
    nodes.push(node);
  }

  recurse(root);
  return nodes;
}
