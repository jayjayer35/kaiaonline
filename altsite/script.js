const container = document.getElementById("container");
const canvas = document.getElementById("connections");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  updateTransforms();
  drawConnections();
});

let scale = 1;
let offsetX = window.innerWidth / 2;
let offsetY = window.innerHeight / 2;

let isDragging = false;
let dragStart = { x: 0, y: 0 };
let nodes = [];
let selectedNode = null;

function updateTransforms() {
  container.style.transform = `translate(${offsetX}px,${offsetY}px) scale(${scale})`;
}

fetch("./data/nodes.json")
  .then(res => {
    if (!res.ok) {
      throw new Error(`Could not load JSON: ${res.statusText}`);
    }
    return res.json();
  })
  .then(data => {
    nodes = data;
    console.log("Loaded nodes:", nodes); // Debug output
    renderNodes();
    updateTransforms();
    drawConnections();
  })
  .catch(err => {
    console.error("Fetch error:", err);
  });

function renderNodes() {
  container.innerHTML = "";
  for (const node of nodes) {
    const el = document.createElement("div");
    el.className = `node ${node.status}`;
    el.dataset.id = node.id;

    el.innerHTML = `
      <div class="header">${node.name}</div>
      <img class="image" src="${node.image}" alt="${node.name}">
    `;
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    container.appendChild(el);

    el.addEventListener("click", e => {
      e.stopPropagation();
      if (selectedNode) {
        selectedNode.classList.remove("selected");
      }
      if (selectedNode === el) {
        selectedNode = null;
      } else {
        el.classList.add("selected");
        selectedNode = el;
      }
      drawConnections();
    });
  }
}

function drawConnections() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  for (const node of nodes) {
    for (const childId of node.children) {
      const child = nodes.find(n => n.id === childId);
      if (child) {
        const startX = node.x + 75;
        const startY = node.y + 40;
        const endX = child.x + 75;
        const endY = child.y + 40;

        ctx.strokeStyle = "#88f";
        ctx.lineWidth = 2 / scale;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(startX, startY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#88f";
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

canvas.addEventListener("mousedown", e => {
  isDragging = true;
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
});

canvas.addEventListener("mouseup", () => isDragging = false);

canvas.addEventListener("mousemove", e => {
  if (isDragging) {
    offsetX += e.clientX - dragStart.x;
    offsetY += e.clientY - dragStart.y;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
    updateTransforms();
    drawConnections();
  }
});

canvas.addEventListener("wheel", e => {
  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  scale *= zoom;
  e.preventDefault();
  updateTransforms();
  drawConnections();
});

requestAnimationFrame(animateGlow);

function animateGlow() {
  if (selectedNode) {
    selectedNode.style.boxShadow = `0 0 ${10 + Math.sin(Date.now() / 200) * 10}px rgba(255,255,255,0.8)`;
  }
  requestAnimationFrame(animateGlow);
}

window.addEventListener("click", () => {
  if (selectedNode) {
    selectedNode.classList.remove("selected");
    selectedNode = null;
  }
  drawConnections();
});
