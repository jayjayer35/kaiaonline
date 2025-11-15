document.addEventListener("click", e => {
  const s = document.createElement("span");
  s.textContent = "✧";
  s.style.position = "fixed";
  s.style.left = e.clientX + "px";
  s.style.top = e.clientY + "px";
  s.style.pointerEvents = "none";
  s.style.opacity = "1";
  s.style.transition = "1s";
  document.body.appendChild(s);
  setTimeout(() => (s.style.opacity = "0"), 10);
  setTimeout(() => s.remove(), 1000);
});
