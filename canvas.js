config = {
  canvas_width: window.innerWidth,
  canvas_height: window.innerHeight - 40,
  CoR: 0.9,
  Acceleration: 1.00,
  GravityY: 0,
  GravityX: 0,
  LinkRetain: 0.5,
  Maxspeed: 5,
  Friction: 0,
  AirResistence: 0.003,
  Stablize: 0,
  CornerFriction: 0,

  MinimumLength: 200,
  MinimumLengthRepulse: 0.001,

  PrintName: 1
};

class Node {
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.mass = 3;

    this.vx = 0;
    this.vy = 0;
  }
}

class Link {
  constructor(n1, n2, r) {
    this.n1 = n1;
    this.n2 = n2;
    this.r = r;
  }
}

/*
let n1 = new Node(300, 300, "node1");
let n2 = new Node(600, 300, "node2");
let n3 = new Node(500, 100, "node3");
let n4 = new Node(500, 400, "node4");
let nodes = [n1, n2, n3, n4];

let l1 = new Link(n1, n2, 300);
let l2 = new Link(n3, n2, 424);
let l3 = new Link(n1, n3, 300);

let l4 = new Link(n1, n4, 424);
let l5 = new Link(n2, n4, 300);
let l6 = new Link(n3, n4, 300);
let links = [l1, l2, l3, l4, l5, l6];
 */

let nodes = []
let links = []
let frame = 0;

/*
function make_circle_nodes(nodes, links, num, r){
  newnodes = [];

  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2 / num)){
    xsta = Math.sin(angle) * r;
    ysta = Math.cos(angle) * r;
    
    xpos = xsta + 400;
    ypos = ysta + 400;
  }
}
*/

function make_square_nodes(nodes, links, xnum, ynum, plen, angle) {
  nodeidx = 0

  let newnode = new Array(xnum);
  for (let i = 0; i < xnum; i++) {
    newnode[i] = new Array(ynum);
  }

  for (let x = 0; x < xnum; x++) {
    for (let y = 0; y < ynum; y++) {
      xsta = x * plen;
      ysta = y * plen;

      xpos = Math.cos(angle) * xsta - Math.sin(angle) * ysta;
      ypos = Math.sin(angle) * xsta + Math.cos(angle) * ysta;

      console.log('pos' + xpos + ' ' + ypos);

      newnode[x][y] = new Node(xpos + 300, ypos + window.innerHeight - 500, "node" + nodeidx);
      nodes.push(newnode[x][y]);
      nodeidx++;

      if (x - 1 >= 0) {
        newlink = new Link(newnode[x][y], newnode[x - 1][y], plen);
        links.push(newlink);
      }
      if (y - 1 >= 0) {
        newlink = new Link(newnode[x][y], newnode[x][y - 1], plen);
        links.push(newlink);
      }

      if (x - 1 >= 0 && y - 1 >= 0) {
        newlink = new Link(newnode[x][y], newnode[x - 1][y - 1], plen * 1.414);
        links.push(newlink);

        newlink = new Link(newnode[x - 1][y], newnode[x][y - 1], plen * 1.414);
        links.push(newlink);
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", function (event) {
  init();
});

/* https://stackoverflow.com/questions/16991341/json-parse-file-path */
function get_json_from_file(path) {

  /*
  var request = new XMLHttpRequest();
  request.open("GET", path, false);
  request.send(null);
  request.onreadystatechange = function() {
    if ( request.readyState === 4 && request.status === 200 ) {
      var json = JSON.parse(request.responseText);
      console.log(json);
      return json;
    }
  }
  console.log("Can't parse json from " + path);
  return {};
*/

  var request = new XMLHttpRequest();
  request.open("GET", path, false);
  request.send(null)
  var my_JSON_object = JSON.parse(request.responseText);
  console.log(my_JSON_object);

  return my_JSON_object;
}

function make_nodes_from_json(json) {
  let nodedict = {};
  for (let i = 0; i < json["nodes"].length; i++) {
    let id = json["nodes"][i]["id"];
    let val = json["nodes"][i]["val"];


    let rndx = Math.floor(Math.random() * config.canvas_width);
    let rndy = Math.floor(Math.random() * config.canvas_height);
    let newnode = new Node(rndx, rndy, id);
    console.log("Id : " + id + " Val : " + val + " Pos :" + rndx + ":" + rndy);
    newnode.mass = val + 10;

    nodes.push(newnode);
    nodedict[id] = newnode;
  }

  for (let i = 0; i < json["links"].length; i++) {
    let source = json["links"][i]["source"];
    let target = json["links"][i]["target"];
    console.log("Source : " + source + " Target : " + target);

    let newlink = new Link(nodedict[source], nodedict[target], 100);
    links.push(newlink);
  }
}

function init() {
  const mycanvas = document.getElementById("mycanvas");
  console.log('mycanvas : ' + mycanvas)
  mycanvas.width = config.canvas_width;
  mycanvas.height = config.canvas_height;

  /* TODO : Read from kernel graph json file */
  var json = get_json_from_file("./d3-data.json")
  make_nodes_from_json(json);

  // make_square_nodes(nodes, links, 5, 5, 50, 1)
  window.requestAnimationFrame(draw);
}

function draw_links(ctx, links) {
  for (let li = 0; li < links.length; li++) {
    let link = links[li];
    let n1 = link.n1;
    let n2 = link.n2;
    ctx.beginPath(); // Start a new path
    ctx.moveTo(n1.x, n1.y); // Move the pen to (30, 50)
    ctx.lineTo(n2.x, n2.y); // Draw a line to (150, 100)

    dist = getDistance(link);
    difflen = Math.abs(dist - link.r)


    ctx.linkwidth = 3;

    ctx.stroke(); // Render the path
  }
}

function draw_nodes(ctx, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.mass, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (config.PrintName == 1) {
      ctx.font = "10px serif";
      ctx.fillText(node.name, node.x + 10, node.y - 10);
    }
  }
}

function getDistance(link) {
  dx = Math.abs(link.n1.x - link.n2.x);
  dy = Math.abs(link.n1.y - link.n2.y);

  return dist = Math.sqrt(dx * dx + dy * dy);
}

function calcpower(link) {
  dist = getDistance(link);
  return (dist - link.r) * config.LinkRetain;
}

function updateVecs(links, nodes) {
  for (let li = 0; li < links.length; li++) {
    let link = links[li];
    let n1 = link.n1;
    let n2 = link.n2;

    let vx = n2.x - n1.x;
    let vy = n2.y - n1.y;

    absvec = Math.sqrt(vx * vx + vy * vy);

    power = calcpower(link)
    n1.vx += vx * power / absvec;
    n1.vy += vy * power / absvec;

    vx *= -1;
    vy *= -1;

    n2.vx += vx * power / absvec;
    n2.vy += vy * power / absvec;


    /*
    if (n1.vx > config.Maxspeed) {
      n1.vx = config.Maxspeed;
    }
    if (n1.vy > config.Maxspeed) {
      n1.vy = config.Maxspeed;
    }
    if (n2.vx > config.Maxspeed) {
      n2.vx = config.Maxspeed;
    }
    if (n2.vy > config.Maxspeed) {
      n2.vy = config.Maxspeed;
    }
    */
  }

  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    node.vx *= config.Acceleration;
    node.vy *= config.Acceleration;

    node.vx += config.GravityX
    node.vy += config.GravityY

    node.vx = node.vx > 0 ?
      node.vx - config.Friction : node.vx + config.Friction;
    node.vy = node.vy > 0 ?
      node.vy - config.Friction : node.vy + config.Friction;

    if (Math.abs(node.vx) < config.Stablize)
      node.vx = 0;
    if (Math.abs(node.vy) < config.Stablize)
      node.vy = 0;

    node.vx -= node.vx * config.AirResistence;
    node.vy -= node.vy * config.AirResistence;
  }
}

function moveNodes(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];

    if (node.vx > config.Maxspeed) {
      node.vx = config.Maxspeed;
    }
    if (node.vy > config.Maxspeed) {
      node.vy = config.Maxspeed;
    }

    if (node.vx < -1 * config.Maxspeed) {
      node.vx = -1 * config.Maxspeed;
    }
    if (node.vy < -1 * config.Maxspeed) {
      node.vy = -1 * config.Maxspeed;
    }
    node.x += node.vx;
    node.y += node.vy;
    /*
    if (Math.abs(node.vx) > config.Stablize)
      node.x += node.vx;
    if (Math.abs(node.vy) > config.Stablize)
      node.y += node.vy;
    */


    /*
  let speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
  if (speed > config.Maxspeed){
      node.vx *= (config.Maxspeed / speed);
      node.vy *= (config.Maxspeed / speed); 
  }
*/

    let BORDER = 10;

    if (node.x > config.canvas_width - BORDER) {
      node.x = config.canvas_width - BORDER;
      node.vx *= (-1 * config.CoR)
      node.vy *= config.CornerFriction
    } else if (node.x < BORDER) {
      node.x = BORDER;
      node.vx *= (-1 * config.CoR);
      node.vy *= config.CornerFriction;
    }

    if (node.y > config.canvas_height - BORDER) {
      node.y = config.canvas_height - BORDER;
      node.vy *= (-1 * config.CoR)
      node.vx *= config.CornerFriction

      // config.GravityY *= -1;

    } else if (node.y < BORDER) {
      node.y = BORDER;
      node.vy *= (-1 * config.CoR)
      node.vx *= config.CornerFriction


      // config.GravityY *= -1;
    }
  }
}

function distract_nodes(nodes) {
  /* TODO : This implementation is slow as hell(O(n^2)). 
    Should find more clever solution. */
  let close_nodepair = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      dx = Math.abs(nodes[i].x - nodes[j].x);
      dy = Math.abs(nodes[i].y - nodes[j].y);
      dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < config.MinimumLength) {
        close_nodepair.push([nodes[i], nodes[j], dist]);
      }
    }
  }

  for (let i = 0; i < close_nodepair.length; i++) {
    let [n1, n2, dist] = close_nodepair[i];

    let vx = n2.x - n1.x;
    let vy = n2.y - n1.y;

    absvec = Math.sqrt(vx * vx + vy * vy);

    power = (config.MinimumLength - dist) * config.MinimumLengthRepulse;
    n1.vx -= vx * power / absvec;
    n1.vy -= vy * power / absvec;

    vx *= -1;
    vy *= -1;

    n2.vx -= vx * power / absvec;
    n2.vy -= vy * power / absvec;
  }
}

function draw() {
  const ctx = document.getElementById("mycanvas").getContext("2d");
  ctx.clearRect(0, 0, config.canvas_width, config.canvas_height); // clear canvas

  frame += 1;
  ctx.font = "20px serif";
  ctx.fillText('Frame : ' + frame, 10, 20);

  draw_nodes(ctx, nodes);
  draw_links(ctx, links);
  updateVecs(links, nodes);
  distract_nodes(nodes);
  moveNodes(nodes);

  window.requestAnimationFrame(draw);
}

