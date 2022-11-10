
class Node {
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.mass = 10;

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

function init() {
  window.requestAnimationFrame(draw);
}

function draw_nodes(ctx, nodes) {
  for (let i = 0; i < nodes.length; i++){
    let node = nodes[i];

    ctx.beginPath();
    ctx.arc(node.x, node.y, node.mass, 0, 2 * Math.PI);
    ctx.stroke();
  
    ctx.font = '10px serif';
    ctx.fillText(node.name, node.x + 10, node.y - 10);
  }
}

function calcpower(link) {
  dx = Math.abs(link.n1.x - link.n2.x);
  dy = Math.abs(link.n1.y - link.n2.y);

  dist = Math.sqrt(dx * dx + dy * dy);

  return (dist - link.r) * 0.0001;
}

function updateVecs(links, nodes) {
  for (let li = 0; li < links.length; li++){
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
  }

  for (let i = 0; i < nodes.length; i++){
    let node = nodes[i];
    node.vx *= 0.999;
    node.vy *= 0.999;
  }
}

function moveNodes(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    node.x += node.vx;
    node.y += node.vy;

    if (node.x > 1280){
      node.x = 1280;
    } else if (node.x < 0){
      node.x = 0;
    }

    if (node.y > 720){
      node.y = 720;
    } else if (node.y < 0){
      node.y = 0;
    }
  }
}

function draw() {
  const ctx = document.getElementById('canvas').getContext('2d');
  ctx.clearRect(0, 0, 1280, 720); // clear canvas

  draw_nodes(ctx, nodes);
  updateVecs(links, nodes);
  moveNodes(nodes);

  window.requestAnimationFrame(draw);
}


let n1 = new Node(500, 100, 'node1');
let n2 = new Node(1000, 100, 'node2');
let n3 = new Node(300, 300, 'node3')
let nodes = [n1, n2, n3];

let l1 = new Link(n1, n2, 100);
let l2 = new Link(n3, n2, 100);
let l3 = new Link(n1, n3, 100);
let links = [l1, l2, l3];

init();