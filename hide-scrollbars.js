(function() {
  const style = document.createElement("style");
  style.innerHTML = `
    html, body {
      overflow: auto;          /* still scrollable */
      -ms-overflow-style: none;  /* IE & Edge legacy */
      scrollbar-width: none;     /* Firefox */
    }
    html::-webkit-scrollbar, 
    body::-webkit-scrollbar {
      display: none;            /* Chrome, Safari, Edge */
    }
  `;
  document.head.appendChild(style);
})();
