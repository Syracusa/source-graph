
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

function draw_node(ctx, node) {
  ctx.beginPath();
  ctx.arc(node.x, node.y, node.mass, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.font = '10px serif';
  ctx.fillText(node.name, node.x + 10, node.y - 10);
}

function calcpower(link) {
  dx = Math.abs(link.n1.x - link.n2.x);
  dy = Math.abs(link.n2.y - link.n2.y);
  
  dist = Math.sqrt(dx * dx + dy * dy);

  return (dist - link.r) * 0.0001
}

function calcVec(n1, n2) {
  vx = l1.n2.x - l1.n1.x;
  vy = l1.n2.y - l1.n1.y;
  absvec = Math.sqrt(vx * vx + vy * vy);

  power = calcpower(l1)

  n1.vx += vx * power / absvec;
  n1.vy += vy * power / absvec;

  vx = l1.n1.x - l1.n2.x;
  vy = l1.n1.y - l1.n2.y;
  
  n2.vx += vx * power / absvec;
  n2.vy += vy * power / absvec;
}

function moveNode(){
  n1.x += n1.vx;
  n1.y += n1.vy;

  n2.x += n2.vx;
  n2.y += n2.vy;
}

function draw() {
  const ctx = document.getElementById('canvas').getContext('2d');
  ctx.clearRect(0, 0, 1280, 720); // clear canvas

  draw_node(ctx, n1);
  draw_node(ctx, n2);
  calcVec(n1, n2);
  moveNode();

  window.requestAnimationFrame(draw);
}


let n1 = new Node(500, 100, 'node1');
let n2 = new Node(1000, 100, 'node2');
let l1 = new Link(n1, n2, 100);
init();