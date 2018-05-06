const fs = require('fs');
const Canvas = require('canvas');
const d3 = require('d3');
const jsdom = require('jsdom');

d3.json("./data/testd3dataAbridged.json", function(error, root) {
  if (error) throw error;
  var links = []
  var newroot = d3.hierarchy(root)
  .sum(function(d) { return d.value; })
  .sort(function(a, b) { return b.value - a.value; });
  d3.pack(root).radius(() => {return 1000});
  
  //var newroot = d3.hierarchy(root.children[3]);

  var leaves = newroot.leaves();
  
  links = newroot.links();



  var nodes = newroot.descendants();
  console.log('leaves',leaves,"links",links,"nodes",nodes);
  
  const parents = [];
  nodes.forEach((node, i) => {
    if (i === 0) return;
    console.log(node.parent.data.name);
    if ((node.parent) && (parents.indexOf(node.parent.data.name) < 0)) {
      parents.push(node.parent.data.name)
    }
  })

  var forceCollide = d3.forceCollide()
      .radius(function(d) { 
        if (d.height == 0) {
          return 110
        } else { return 0}; 
      })
      .iterations(3);  

  var simulation = d3.forceSimulation(nodes)
      //.force("charge", d3.forceManyBody().strength(-1))
      .force("links", d3.forceLink(links).distance(0).iterations(10))
      //.force("gravity", d3.forceManyBody().strength(-5))
      .force("collide", forceCollide)
      //.force("collide", d3.forceCollide(10).iterations(3))
      .force("center", d3.forceCenter())
      // .force("x", d3.forceX())
      // .force("y", d3.forceY())
      //.on("tick", ticked);
      .stop();

  var canvas = document.querySelector("canvas"),
      context = canvas.getContext("2d"),
      width = canvas.width,
      height = canvas.height;

  d3.select(canvas)
      .call(d3.drag()
          .container(canvas)
          .subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
 

  d3.timeout(function() {
    console.log('start');
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        simulation.tick();
        if (i % 50 == 0) console.log('tick' + i + " of " + n);
      }

    console.log(nodes);

    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);

    context.beginPath();
    links.forEach(drawLink);
    
    
    nodes.forEach((d) => {
      drawNode(d);
    });
    context.restore();
    console.log('done');

  });

  function ticked() {
  }

  function dragsubject() {
    return simulation.find(d3.event.x - width / 2, d3.event.y - height / 2);
  }

  function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

  function drawLink(d) {

    const strokeFill = color(parents.indexOf(d.source.data.name));
    context.strokeStyle = strokeFill;
    context.stroke();
    context.moveTo(d.source.x, d.source.y);

    context.lineTo(d.target.x, d.target.y);
  }

  const color = d3.scaleLinear()
      .domain([0, 100])
      .range(["red", "green"]);

  function drawNode(d) {
    console.log('d.data',d.data);
    console.log('d.parent',d.parent);
    
    let parent = '';
    if (d.data.name == 'products') {parent = 'products';}
    else {
      parent = d.parent.data.name;
      
    }

    let fillnode = color(parents.indexOf(parent));
    let r = d.height == 0 ? 100 : 1;
    context.beginPath();
    context.moveTo(d.x + 3, d.y);
    context.arc(d.x, d.y, r, 0, 2 * Math.PI);
    context.fillStyle = fillnode;
    context.fill();
    context.strokeStyle = fillnode;
    context.stroke();
    context.font="20px Arial";
    context.fillStyle = "black";
    context.textAlign = "center";
    context.fillText(parent, d.x, d.y + 20);
    // if (d.parent != null && d.parent.parent != null) {const grandparent = d.parent.parent.data.name} else {const grandparent = 'root'};
    // context.fillText(grandparent ? grandparent : '', d.x, d.y);
    context.font="10px Arial";
    context.fillText(d.data.name, d.x, d.y);
    }
  }
);  



