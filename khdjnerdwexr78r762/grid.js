// refs
const grid          = document.getElementById('grid');
const gridScaler    = document.getElementById('grid-scaler');
const gridContainer = document.getElementById('grid-container');

const selectToolBtn  = document.getElementById('select-tool');
const addTokenBtn    = document.getElementById('add-token');
const lineToolBtn    = document.getElementById('line-tool');
const eraseToolBtn   = document.getElementById('erase-tool');
const measureToolBtn = document.getElementById('measure-tool');
const clearBtn       = document.getElementById('clear');
const toggleGridBtn  = document.getElementById('toggle-grid');
const undoBtn        = document.getElementById('undo-btn');
const redoBtn        = document.getElementById('redo-btn');
const deleteSelectedBtn = document.getElementById('delete-selected');

const showCommandsBtn = document.getElementById('show-commands');
const commandBox      = document.getElementById('command-box');
const closeCommandBtn = document.getElementById('close-command');

const tokenBox       = document.getElementById('token-box');
const tokenBoxTitle  = document.getElementById('token-box-title');
const tokenLabelInput = document.getElementById('token-label');
const tokenShapeInput = document.getElementById('token-shape');
const tokenColor      = document.getElementById('token-color');
const tokenAlpha      = document.getElementById('token-alpha');
const tokenHp         = document.getElementById('token-hp');
const tokenHpMax      = document.getElementById('token-hpmax');
const tokenEffects    = document.getElementById('token-effects');
const closeTokenBtn   = document.getElementById('close-token');
const cancelTokenBtn  = document.getElementById('cancel-token');
const createTokenBtn  = document.getElementById('create-token');
const presetSwatches  = document.getElementById('preset-swatches');

const colsInput  = document.getElementById('cols');
const rowsInput  = document.getElementById('rows');
const resizeBtn  = document.getElementById('resize-grid');

const backgroundUpload      = document.getElementById('background-upload');
const resetBackgroundBtn    = document.getElementById('reset-background');
const gridBackgroundUpload  = document.getElementById('grid-background-upload');
const resetGridBackgroundBtn= document.getElementById('reset-grid-background');
const saveSceneBtn   = document.getElementById('save-scene');
const loadSceneBtn   = document.getElementById('load-scene');
const exportSceneBtn = document.getElementById('export-scene');
const importSceneInput = document.getElementById('import-scene');

const tokenListEntries = document.getElementById('token-list-entries');
const initEntriesEl    = document.getElementById('initiative-entries');
const initAddBtn       = document.getElementById('init-add');
const initSortBtn      = document.getElementById('init-sort');
const initNextBtn      = document.getElementById('init-next');

const zoomDisplay  = document.getElementById('zoom-display');
const zoomInBtn    = document.getElementById('zoom-in');
const zoomOutBtn   = document.getElementById('zoom-out');
const zoomResetBtn = document.getElementById('zoom-reset');

const settingsToggleBtn = document.getElementById('settings-toggle');
const settingsBar       = document.getElementById('settings-bar');

// st
let currentMode = 'select';
let dragTokens = [];
let dragOffsets = new Map();
let gridLinesVisible = true;
let zoom = 1;
let baseSquareSize = 70;
let gridCols = 20;
let gridRows = 10;
let undoStack = [];
let redoStack = [];
let editingToken = null;
let isErasing = false;
let lineStart = null;
let tempLine = null;
let measureStart = null;
let tempMeasureLine = null;
let tempMeasureLabel = null;
let isDrawing = false;
let currentDrawSvg = null;
let currentDrawPolyline = null;
let drawPoints = [];
let tokenIdCounter = 0;
let initIdCounter = 0;
let currentInitIndex = -1;
let selectedTokens = new Set();
let isBoxSelecting = false;
let boxSelectStart = null;
let boxSelectEl = null;
let spaceHeld = false;
let isPanning = false;
let panStart = null;

const colorPresets = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#ecf0f1','#34495e','#555555'];
const colorPastel  = ['#f4a5a5','#f9c89a','#fdf3a5','#a8f0b8','#a5e8e0','#a5c8f9','#d4a5f9','#f9e4f9','#b8b8c8','#8a9a8a'];

// toast feature got mad annoying during testing so we kill it
function showToast() {}

// color functionality
function hexToRgb(hex) {
  hex = hex.replace(/^#/,'');
  if (hex.length === 3) hex = hex.split('').map(x=>x+x).join('');
  const n = parseInt(hex,16);
  return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
}
function textColor(r,g,b) {
  const gray = 0.299*r + 0.587*g + 0.114*b;
  const inv = 255-gray;
  return `rgb(${inv},${inv},${inv})`;
}

// color swatches functionality
let currentTokenColor = '#555555';
const colorGrid = document.getElementById('color-grid');
const tokenColorPicker = document.getElementById('token-color');

function buildColorGrid() {
  colorGrid.innerHTML = '';
  const allColors = [...colorPresets, ...colorPastel];
  allColors.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'swatch';
    sw.style.background = c;
    sw.title = c;
    sw.addEventListener('click', () => {
      currentTokenColor = c;
      tokenColorPicker.value = c;
      colorGrid.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected-swatch'));
      sw.classList.add('selected-swatch');
      if (editingToken) applyColorToEditingToken();
    });
    colorGrid.appendChild(sw);
  });
  // custom picker swatch at end
  const pickerSw = document.createElement('div');
  pickerSw.className = 'swatch picker-swatch';
  pickerSw.title = 'Custom color…';
  pickerSw.style.background = 'linear-gradient(135deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f)';
  pickerSw.addEventListener('click', () => tokenColorPicker.click());
  colorGrid.appendChild(pickerSw);
}
buildColorGrid();

tokenColorPicker.addEventListener('input', () => {
  currentTokenColor = tokenColorPicker.value;
  colorGrid.querySelectorAll('.swatch:not(.picker-swatch)').forEach(s => s.classList.remove('selected-swatch'));
  if (editingToken) applyColorToEditingToken();
});

function applyColorToEditingToken() {
  const c = hexToRgb(currentTokenColor);
  const a = parseFloat(document.getElementById('token-alpha').value) / 100;
  editingToken.style.background = `rgba(${c.r},${c.g},${c.b},${a})`;
  editingToken.style.color = textColor(c.r,c.g,c.b);
  refreshTokenListEntry(editingToken);
}

// draw color swatches
const drawColors = ['#ffffff','#000000','#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22'];
let currentDrawColor = '#ffffff';
let currentDrawSize  = 4;
const drawSwatchesEl = document.getElementById('draw-swatches');
const drawColorPickerEl = document.getElementById('draw-color-picker');
const drawSizeEl = document.getElementById('draw-size');

function buildDrawSwatches() {
  drawSwatchesEl.style.display = 'flex';
  drawSwatchesEl.style.gap = '4px';
  drawColors.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'draw-swatch';
    sw.style.background = c;
    sw.title = c;
    if (c === currentDrawColor) sw.classList.add('selected-swatch');
    sw.addEventListener('click', () => {
      currentDrawColor = c;
      drawColorPickerEl.value = c;
      drawSwatchesEl.querySelectorAll('.draw-swatch').forEach(s => s.classList.remove('selected-swatch'));
      sw.classList.add('selected-swatch');
    });
    drawSwatchesEl.appendChild(sw);
  });
}
buildDrawSwatches();

drawColorPickerEl.addEventListener('input', () => {
  currentDrawColor = drawColorPickerEl.value;
  drawSwatchesEl.querySelectorAll('.draw-swatch').forEach(s => s.classList.remove('selected-swatch'));
});
drawSizeEl.addEventListener('change', () => { currentDrawSize = parseInt(drawSizeEl.value)||4; });

// grid sizing
function applyGridSize() {
  const w = gridCols * baseSquareSize;
  const h = gridRows * baseSquareSize;
  grid.style.width  = w + 'px';
  grid.style.height = h + 'px';
  grid.style.setProperty('--sq', baseSquareSize + 'px');
  // scale the scaler wrapper so scrollbars reflect actual render size
  gridScaler.style.width  = Math.ceil(w * zoom) + 'px';
  gridScaler.style.height = Math.ceil(h * zoom) + 'px';
  grid.style.transform = `scale(${zoom})`;
}

function applyZoom(newZoom) {
  zoom = Math.min(4, Math.max(0.15, newZoom));
  zoomDisplay.textContent = Math.round(zoom * 100) + '%';
  grid.style.setProperty('--zoom', zoom);
  applyGridSize();
}

resizeBtn.addEventListener('click', () => {
  gridCols = parseInt(colsInput.value) || 20;
  gridRows = parseInt(rowsInput.value) || 10;
  applyGridSize();
});

zoomInBtn.addEventListener('click',  () => applyZoom(zoom + 0.1));
zoomOutBtn.addEventListener('click', () => applyZoom(zoom - 0.1));
zoomResetBtn.addEventListener('click',() => applyZoom(1));

gridContainer.addEventListener('wheel', e => {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  applyZoom(zoom + (e.deltaY < 0 ? 0.08 : -0.08));
}, { passive: false });

// settings tggle
settingsToggleBtn.addEventListener('click', () => {
  settingsBar.classList.toggle('open');
  settingsToggleBtn.style.background = settingsBar.classList.contains('open') ? '#446' : '#555';
});

// coord
function toGrid(clientX, clientY) {
  const rect = grid.getBoundingClientRect();
  return { x: (clientX - rect.left) / zoom, y: (clientY - rect.top) / zoom };
}

// undo and rtedo
function pushHistory(entry) { undoStack.push(entry); redoStack = []; refreshUndoRedo(); }
function refreshUndoRedo() { undoBtn.disabled = !undoStack.length; redoBtn.disabled = !redoStack.length; }

function undo() {
  const last = undoStack.pop(); if (!last) return;
  applyHistoryReverse(last);
  redoStack.push(last); refreshUndoRedo();
}
function redo() {
  const last = redoStack.pop(); if (!last) return;
  applyHistoryForward(last);
  undoStack.push(last); refreshUndoRedo();
}
function applyHistoryReverse(h) {
  if (h.action === 'add') {
    h.element.remove();
    if (h.type === 'token') { removeTokenListEntry(h.element); selectedTokens.delete(h.element); }
  } else if (h.action === 'remove') {
    grid.appendChild(h.element);
    if (h.type === 'token') addTokenListEntry(h.element);
  }
}
function applyHistoryForward(h) {
  if (h.action === 'add') {
    grid.appendChild(h.element);
    if (h.type === 'token') addTokenListEntry(h.element);
  } else if (h.action === 'remove') {
    h.element.remove();
    if (h.type === 'token') { removeTokenListEntry(h.element); selectedTokens.delete(h.element); }
  }
}

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

// ,multi select
function clearSelection() {
  selectedTokens.forEach(t => t.classList.remove('selected'));
  selectedTokens.clear();
}
function selectToken(token, additive) {
  if (!additive) clearSelection();
  token.classList.add('selected');
  selectedTokens.add(token);
}
function deleteSelected() {
  if (!selectedTokens.size) return;
  selectedTokens.forEach(t => {
    pushHistory({ type:'token', action:'remove', element:t });
    removeTokenListEntry(t);
    t.remove();
  });
  selectedTokens.clear();
  showToast('Deleted selected');
}
deleteSelectedBtn.addEventListener('click', deleteSelected);

const drawToolBtn    = document.getElementById('draw-tool');
const drawColorRow   = document.getElementById('draw-color-row');
const drawEraseBtn   = document.getElementById('draw-erase-btn');
let drawEraseMode    = false;

// toolsbar
function setMode(mode) {
  currentMode = mode;
  [selectToolBtn, lineToolBtn, eraseToolBtn, measureToolBtn, drawToolBtn].forEach(b =>
    b.classList.remove('active','line','erase','measure','select','draw'));
  grid.style.borderColor = '#999999d0';
  grid.style.boxShadow   = '0 0 5px rgba(255,255,255,0.36)';
  drawColorRow.classList.remove('visible');
  drawEraseMode = false;
  drawEraseBtn.classList.remove('active','draw-erase');
  if (mode === 'select')  { selectToolBtn.classList.add('active','select'); }
  if (mode === 'line')    { lineToolBtn.classList.add('active','line');   grid.style.borderColor='#336'; grid.style.boxShadow='0 0 10px #3366ff99'; }
  if (mode === 'erase')   { eraseToolBtn.classList.add('active','erase'); grid.style.borderColor='#a33'; grid.style.boxShadow='0 0 10px #ff333399'; }
  if (mode === 'measure') { measureToolBtn.classList.add('active','measure'); grid.style.borderColor='#885500'; grid.style.boxShadow='0 0 10px #cc880099'; }
  if (mode === 'draw')    { drawToolBtn.classList.add('active','draw'); grid.style.borderColor='#556b44'; grid.style.boxShadow='0 0 10px #88bb4499'; drawColorRow.classList.add('visible'); }
}
selectToolBtn.addEventListener('click',  () => setMode('select'));
lineToolBtn.addEventListener('click',    () => setMode(currentMode==='line'    ? 'select' : 'line'));
eraseToolBtn.addEventListener('click',   () => setMode(currentMode==='erase'   ? 'select' : 'erase'));
measureToolBtn.addEventListener('click', () => setMode(currentMode==='measure' ? 'select' : 'measure'));
drawToolBtn.addEventListener('click',    () => setMode(currentMode==='draw'    ? 'select' : 'draw'));
drawEraseBtn.addEventListener('click',   () => {
  drawEraseMode = !drawEraseMode;
  drawEraseBtn.classList.toggle('active', drawEraseMode);
  drawEraseBtn.classList.toggle('draw-erase', drawEraseMode);
});
setMode('select');

// erase
function eraseAt(cx, cy) {
  // TEMPORARILY!!!! enable ptr-events on drawings so elementsfrompoint can hit them
  const drawings = document.querySelectorAll('.freehand-path');
  drawings.forEach(d => d.style.pointerEvents = 'all');

  const erased = new Set();
  document.elementsFromPoint(cx, cy).forEach(el => {
    const target = el.closest('.wall') || el.closest('.token') || el.closest('.freehand-path');
    if (!target || target === grid || erased.has(target)) return;
    erased.add(target);
    if (target.classList.contains('wall') || target.classList.contains('freehand-path')) {
      pushHistory({ type: target.classList.contains('wall') ? 'wall' : 'drawing', action:'remove', element:target });
      target.remove();
    } else if (target.classList.contains('token')) {
      pushHistory({ type:'token', action:'remove', element:target });
      removeTokenListEntry(target); selectedTokens.delete(target);
      target.remove();
    }
  });

  // re-disable ptr-events on any remaining drawings
  document.querySelectorAll('.freehand-path').forEach(d => d.style.pointerEvents = 'none');
}

// ptr
grid.addEventListener('mousedown', e => {
  if (spaceHeld) return;
  const { x, y } = toGrid(e.clientX, e.clientY);

  if (currentMode === 'line') {
    lineStart = { x, y };
    tempLine = document.createElement('div');
    tempLine.className = 'wall';
    tempLine.style.left = x + 'px'; tempLine.style.top = y + 'px'; tempLine.style.width = '0';
    grid.appendChild(tempLine);

  } else if (currentMode === 'erase') {
    isErasing = true; eraseAt(e.clientX, e.clientY);

  } else if (currentMode === 'measure') {
    measureStart = { x, y };
    tempMeasureLine = document.createElement('div');
    tempMeasureLine.className = 'measure-line';
    tempMeasureLine.style.left = x+'px'; tempMeasureLine.style.top = y+'px';
    grid.appendChild(tempMeasureLine);
    tempMeasureLabel = document.createElement('div');
    tempMeasureLabel.className = 'measure-label';
    grid.appendChild(tempMeasureLabel);

  } else if (currentMode === 'draw') {
    if (drawEraseMode) {
      isErasing = true; eraseAt(e.clientX, e.clientY);
    } else {
      isDrawing = true;
      const svgNS = 'http://www.w3.org/2000/svg';
      currentDrawSvg = document.createElementNS(svgNS, 'svg');
      currentDrawSvg.setAttribute('width', grid.offsetWidth);
      currentDrawSvg.setAttribute('height', grid.offsetHeight);
      currentDrawSvg.classList.add('freehand-path');
      currentDrawPolyline = document.createElementNS(svgNS, 'polyline');
      currentDrawPolyline.setAttribute('stroke', currentDrawColor);
      currentDrawPolyline.setAttribute('stroke-width', currentDrawSize);
      currentDrawPolyline.setAttribute('stroke-linecap', 'round');
      currentDrawPolyline.setAttribute('stroke-linejoin', 'round');
      currentDrawPolyline.setAttribute('fill', 'none');
      drawPoints = [`${x},${y}`];
      currentDrawPolyline.setAttribute('points', drawPoints.join(' '));
      currentDrawSvg.appendChild(currentDrawPolyline);
      grid.appendChild(currentDrawSvg);
    }

  } else if (currentMode === 'select' && e.target === grid) {
    clearSelection();
    isBoxSelecting = true;
    boxSelectStart = { x: e.clientX, y: e.clientY };
    boxSelectEl = document.createElement('div');
    boxSelectEl.className = 'select-box';
    document.body.appendChild(boxSelectEl);
  }
});

document.addEventListener('mousemove', e => {
  if (dragTokens.length) {
    const { x, y } = toGrid(e.clientX, e.clientY);
    dragTokens.forEach(t => {
      const off = dragOffsets.get(t);
      t.style.left = (x - off.x) + 'px';
      t.style.top  = (y - off.y) + 'px';
    });
  }

  if (isErasing) eraseAt(e.clientX, e.clientY);

  if (isDrawing && currentDrawPolyline) {
    const { x, y } = toGrid(e.clientX, e.clientY);
    drawPoints.push(`${x},${y}`);
    currentDrawPolyline.setAttribute('points', drawPoints.join(' '));
  }

  if (lineStart && tempLine) {
    const { x, y } = toGrid(e.clientX, e.clientY);
    const dx = x - lineStart.x, dy = y - lineStart.y;
    tempLine.style.width     = Math.sqrt(dx*dx+dy*dy) + 'px';
    tempLine.style.transform = `rotate(${Math.atan2(dy,dx)*180/Math.PI}deg)`;
  }

  if (measureStart && tempMeasureLine) {
    const { x, y } = toGrid(e.clientX, e.clientY);
    const dx = x - measureStart.x, dy = y - measureStart.y;
    const len = Math.sqrt(dx*dx+dy*dy);
    tempMeasureLine.style.width     = len + 'px';
    tempMeasureLine.style.transform = `rotate(${Math.atan2(dy,dx)*180/Math.PI}deg)`;
    const sq = (len / baseSquareSize).toFixed(1);
    const ft = Math.round(len / baseSquareSize * 5);
    tempMeasureLabel.textContent = `${sq} sq / ${ft} ft`;
    tempMeasureLabel.style.left = (measureStart.x + dx/2 + 8) + 'px';
    tempMeasureLabel.style.top  = (measureStart.y + dy/2 - 11) + 'px';
  }

  if (isBoxSelecting && boxSelectEl) {
    const x1 = Math.min(boxSelectStart.x, e.clientX);
    const y1 = Math.min(boxSelectStart.y, e.clientY);
    Object.assign(boxSelectEl.style, {
      left: x1+'px', top: y1+'px',
      width: Math.abs(e.clientX-boxSelectStart.x)+'px',
      height: Math.abs(e.clientY-boxSelectStart.y)+'px'
    });
  }

  if (isPanning && panStart) {
    gridContainer.scrollLeft = panStart.sl - (e.clientX - panStart.x);
    gridContainer.scrollTop  = panStart.st - (e.clientY - panStart.y);
  }
});

document.addEventListener('mouseup', e => {
  dragTokens = []; dragOffsets.clear();
  isErasing = false;

  if (isDrawing) {
    isDrawing = false;
    if (drawPoints.length > 1 && currentDrawSvg) {
      pushHistory({ type:'drawing', action:'add', element:currentDrawSvg });
    } else if (currentDrawSvg) {
      currentDrawSvg.remove();
    }
    currentDrawSvg = null; currentDrawPolyline = null; drawPoints = [];
  }

  if (lineStart && tempLine) {
    if (parseFloat(tempLine.style.width) < 3) tempLine.remove();
    else pushHistory({ type:'wall', action:'add', element:tempLine });
    lineStart = null; tempLine = null;
  }
  if (measureStart) {
    if (tempMeasureLine) tempMeasureLine.remove();
    if (tempMeasureLabel) tempMeasureLabel.remove();
    measureStart = null; tempMeasureLine = null; tempMeasureLabel = null;
  }
  if (isBoxSelecting) {
    isBoxSelecting = false;
    if (boxSelectEl) {
      const br = boxSelectEl.getBoundingClientRect();
      document.querySelectorAll('.token').forEach(t => {
        const r = t.getBoundingClientRect();
        if (!(r.right<br.left||r.left>br.right||r.bottom<br.top||r.top>br.bottom))
          selectToken(t, true);
      });
      boxSelectEl.remove(); boxSelectEl = null;
    }
  }
  isPanning = false; panStart = null;
  gridContainer.style.cursor = spaceHeld ? 'grab' : 'default';
});

// space to pan
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT'
      && document.activeElement.tagName !== 'TEXTAREA'
      && document.activeElement.tagName !== 'SELECT') {
    spaceHeld = true; gridContainer.style.cursor = 'grab'; e.preventDefault();
  }
});
document.addEventListener('keyup', e => {
  if (e.code === 'Space') { spaceHeld = false; gridContainer.style.cursor = 'default'; }
});

gridContainer.addEventListener('mousedown', e => {
  if (spaceHeld) {
    isPanning = true;
    panStart = { x: e.clientX, y: e.clientY, sl: gridContainer.scrollLeft, st: gridContainer.scrollTop };
    gridContainer.style.cursor = 'grabbing';
  }
});

// shortcuts
document.addEventListener('keydown', e => {
  const typing = ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName);
  if ((e.ctrlKey||e.metaKey) && !e.shiftKey && e.key.toLowerCase()==='z') { e.preventDefault(); undo(); return; }
  if ((e.ctrlKey||e.metaKey) && (e.key.toLowerCase()==='y' || (e.shiftKey&&e.key.toLowerCase()==='z'))) { e.preventDefault(); redo(); return; }
  if (typing) return;
  if (e.key==='Delete'||e.key==='Backspace') { e.preventDefault(); deleteSelected(); }
  if (e.key.toLowerCase()==='v') setMode('select');
  if (e.key.toLowerCase()==='l') setMode(currentMode==='line'?'select':'line');
  if (e.key.toLowerCase()==='e') setMode(currentMode==='erase'?'select':'erase');
  if (e.key.toLowerCase()==='m') setMode(currentMode==='measure'?'select':'measure');
  if (e.key.toLowerCase()==='d') setMode(currentMode==='draw'?'select':'draw');
  if (e.key.toLowerCase()==='t') openTokenModalNew();
  if (e.key==='Escape') { tokenBox.style.display='none'; commandBox.style.display='none'; }
});

// token
let placeholder = document.createElement('div'); placeholder.className = 'placeholder';
let draggingEntry = null;

function addTokenListEntry(token) {
  const entry = document.createElement('div');
  entry.className = 'entry';
  entry.dataset.tokenId = token.dataset.tokenId;
  entry.draggable = true;

  const dot = document.createElement('span');
  dot.className = 'dot';
  dot.style.background = token.style.background;
  const lbl = document.createElement('span');
  lbl.textContent = token.dataset.name || '(token)';

  entry.appendChild(dot); entry.appendChild(lbl);
  entry.addEventListener('click', () => selectToken(token, false));

  entry.addEventListener('dragstart', () => {
    draggingEntry = entry; entry.classList.add('dragging');
    tokenListEntries.appendChild(placeholder);
  });
  entry.addEventListener('dragend', () => {
    entry.classList.remove('dragging'); placeholder.remove(); draggingEntry = null;
  });

  tokenListEntries.insertBefore(entry, tokenListEntries.firstChild);
}
function removeTokenListEntry(token) {
  const e = tokenListEntries.querySelector(`[data-token-id="${token.dataset.tokenId}"]`);
  if (e) e.remove();
}
function refreshTokenListEntry(token) {
  const e = tokenListEntries.querySelector(`[data-token-id="${token.dataset.tokenId}"]`);
  if (!e) return;
  e.querySelector('.dot').style.background = token.style.background;
  e.querySelector('span:last-child').textContent = token.dataset.name || '(token)';
}

tokenListEntries.addEventListener('dragover', e => {
  e.preventDefault();
  const after = getDragAfter(tokenListEntries, e.clientY);
  after ? tokenListEntries.insertBefore(placeholder, after) : tokenListEntries.appendChild(placeholder);
});
tokenListEntries.addEventListener('drop', () => {
  if (!draggingEntry) return;
  tokenListEntries.insertBefore(draggingEntry, placeholder);
  placeholder.remove();
  [...tokenListEntries.querySelectorAll('.entry')].forEach((el,i) => {
    const t = document.querySelector(`.token[data-token-id="${el.dataset.tokenId}"]`);
    if (t) t.style.zIndex = 10 + 200 - i;
  });
  draggingEntry.classList.remove('dragging'); draggingEntry = null;
});
function getDragAfter(container, y) {
  return [...container.querySelectorAll('.entry:not(.dragging)')].reduce((closest, child) => {
    const off = y - child.getBoundingClientRect().top - child.getBoundingClientRect().height/2;
    return (off < 0 && off > closest.offset) ? { offset:off, element:child } : closest;
  }, { offset:-Infinity }).element;
}

// grid toggle
toggleGridBtn.addEventListener('click', () => {
  gridLinesVisible = !gridLinesVisible;
  grid.style.setProperty('--grid-line-color', gridLinesVisible ? 'rgba(255,255,255,0.2)' : 'transparent');
});

// board CLEAR! - by toby fox
clearBtn.addEventListener('click', () => {
  if (!confirm('Clear the entire map? This cannot be undone.')) return;
  document.querySelectorAll('.token,.wall,.freehand-path').forEach(el => el.remove());
  tokenListEntries.innerHTML = '';
  initEntriesEl.innerHTML = '';
  selectedTokens.clear();
  undoStack = []; redoStack = []; refreshUndoRedo();
  currentInitIndex = -1;
});

// drag func
function makeDraggable(header, box) {
  header.addEventListener('mousedown', e => {
    if (e.button !== 0 || e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    const rect = box.getBoundingClientRect();
    box.style.transform = 'none';
    box.style.left = rect.left + 'px';
    box.style.top  = rect.top  + 'px';
    const ox = e.clientX - rect.left, oy = e.clientY - rect.top;
    const mv = e2 => { box.style.left = e2.clientX-ox+'px'; box.style.top = e2.clientY-oy+'px'; };
    const up = () => { document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); };
    document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up);
  });
}
function centerPanel(box) {
  box.style.left = '50%'; box.style.top = '50%'; box.style.transform = 'translate(-50%,-50%)';
}
[commandBox, tokenBox].forEach(centerPanel);
makeDraggable(commandBox.querySelector('.panel-header'), commandBox);
makeDraggable(tokenBox.querySelector('.panel-header'), tokenBox);

showCommandsBtn.addEventListener('click', () => commandBox.style.display = 'block');
closeCommandBtn.addEventListener('click', () => commandBox.style.display = 'none');

// token creation
function renderTokenBadges(token) {
  let badge = token.querySelector('.hp-badge');
  if (token.dataset.hp || token.dataset.hpmax) {
    if (!badge) { badge = document.createElement('div'); badge.className = 'hp-badge'; token.appendChild(badge); }
    badge.textContent = (token.dataset.hp||'?') + '/' + (token.dataset.hpmax||'?');
  } else if (badge) badge.remove();

  let effectBadge = token.querySelector('.effect-badge');
  if (token.dataset.effects) {
    if (!effectBadge) { effectBadge = document.createElement('div'); effectBadge.className = 'effect-badge'; token.appendChild(effectBadge); }
    const list = token.dataset.effects.split(',').map(s => s.trim()).filter(Boolean);
    effectBadge.textContent = list.join('\n');
    effectBadge.title = list.join(', ');
  } else if (effectBadge) effectBadge.remove();

  let nameEl = token.querySelector('.token-name');
  if (token.dataset.name) {
    if (!nameEl) { nameEl = document.createElement('div'); nameEl.className = 'token-name'; token.appendChild(nameEl); }
    nameEl.textContent = token.dataset.name;
  } else if (nameEl) nameEl.remove();
}

function attachTokenEvents(token) {
  token.addEventListener('mousedown', e => {
    if (e.button !== 0 || spaceHeld || currentMode !== 'select') return;
    e.stopPropagation();
    if (!token.classList.contains('selected')) selectToken(token, e.shiftKey || e.ctrlKey);
    else if (e.shiftKey || e.ctrlKey) { token.classList.remove('selected'); selectedTokens.delete(token); return; }
    dragTokens = [...selectedTokens];
    const { x, y } = toGrid(e.clientX, e.clientY);
    dragTokens.forEach(t => dragOffsets.set(t, { x: x - parseFloat(t.style.left), y: y - parseFloat(t.style.top) }));
  });
  token.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); openTokenModal(token); }
  });
}

function openTokenModalNew() {
  editingToken = null;
  tokenBoxTitle.textContent = 'New Token';
  tokenLabelInput.value = '';
  document.getElementById('token-size').value = 1;
  tokenShapeInput.value = 'circle';
  currentTokenColor = '#555555';
  tokenColorPicker.value = '#555555';
  colorGrid.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected-swatch'));
  document.getElementById('token-alpha').value = 100;
  tokenHp.value = ''; tokenHpMax.value = '';
  tokenEffects.value = '';
  centerPanel(tokenBox);
  tokenBox.style.display = 'block';
}
function openTokenModal(token) {
  editingToken = token;
  tokenBoxTitle.textContent = 'Edit Token';
  tokenLabelInput.value = token.dataset.name || '';
  const pxSize = parseFloat(token.style.width) || 70;
  document.getElementById('token-size').value = +(pxSize / baseSquareSize).toFixed(2);
  tokenShapeInput.value = token.dataset.shape || 'circle';
  const m = token.style.background.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (m) {
    const hex = '#' + ((1<<24)+(+m[1]<<16)+(+m[2]<<8)+ +m[3]).toString(16).slice(1);
    currentTokenColor = hex;
    tokenColorPicker.value = hex;
    colorGrid.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected-swatch'));
    document.getElementById('token-alpha').value = m[4] ? +m[4]*100 : 100;
  }
  tokenHp.value = token.dataset.hp || '';
  tokenHpMax.value = token.dataset.hpmax || '';
  tokenEffects.value = token.dataset.effects || '';
  centerPanel(tokenBox);
  tokenBox.style.display = 'block';
}

addTokenBtn.addEventListener('click', openTokenModalNew);
closeTokenBtn.addEventListener('click',  () => tokenBox.style.display = 'none');
cancelTokenBtn.addEventListener('click', () => tokenBox.style.display = 'none');

document.getElementById('token-alpha').addEventListener('input', () => {
  if (editingToken) applyColorToEditingToken();
});

createTokenBtn.addEventListener('click', () => {
  const name    = tokenLabelInput.value.trim();
  const effects = tokenEffects.value.trim();
  const sq    = parseFloat(document.getElementById('token-size').value) || 1;
  const size  = Math.round(sq * baseSquareSize);
  const shape = tokenShapeInput.value;
  const c     = hexToRgb(currentTokenColor);
  const a     = parseFloat(document.getElementById('token-alpha').value) / 100;
  const bgStr = `rgba(${c.r},${c.g},${c.b},${a})`;
  const tc    = textColor(c.r,c.g,c.b);
  const fs    = Math.max(10, Math.min(32, Math.floor(size/3.5)))+'px';

  function applyShape(el, sh, sz) {
    el.style.borderRadius = '0';
    el.style.clipPath = '';
    el.classList.remove('shaped');
    if (sh === 'circle')   { el.style.borderRadius = Math.floor(sz/2)+'px'; }
    if (sh === 'diamond')  { el.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'; el.classList.add('shaped'); }
    if (sh === 'triangle') { el.style.clipPath = 'polygon(50% 0%, 100% 100%, 0% 100%)'; el.classList.add('shaped'); }
    if (sh === 'star')     { el.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; el.classList.add('shaped'); }
  }

  if (editingToken) {
    const t = editingToken;
    Object.assign(t.dataset, { name, hp: tokenHp.value, hpmax: tokenHpMax.value, shape, effects });
    Object.assign(t.style, { width:size+'px', height:size+'px', background:bgStr, color:tc, fontSize:fs });
    applyShape(t, shape, size);
    renderTokenBadges(t);
    refreshTokenListEntry(t);
    editingToken = null;
  } else {
    const token = document.createElement('div');
    token.className = 'token';
    token.dataset.tokenId = 'tok' + (tokenIdCounter++);
    Object.assign(token.dataset, { name, hp: tokenHp.value, hpmax: tokenHpMax.value, shape, effects });
    Object.assign(token.style, {
      width:size+'px', height:size+'px', background:bgStr, color:tc, fontSize:fs,
      left: (grid.offsetWidth/2 - size/2)+'px',
      top:  (grid.offsetHeight/2 - size/2)+'px',
      zIndex: 10 + tokenIdCounter
    });
    applyShape(token, shape, size);
    attachTokenEvents(token);
    grid.appendChild(token);
    renderTokenBadges(token);
    pushHistory({ type:'token', action:'add', element:token });
    addTokenListEntry(token);
  }
  tokenBox.style.display = 'none';
});

// custom bg
backgroundUpload.addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.658)),url(${ev.target.result})`;
    document.body.style.backgroundSize = 'cover';
  };
  r.readAsDataURL(f);
});
resetBackgroundBtn.addEventListener('click', () => {
  document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.658)),url("../assets/galaxybkgndblue.jpg")`;
  document.body.style.backgroundSize = '';
});
gridBackgroundUpload.addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    grid.style.backgroundImage = `url(${ev.target.result})`;
    grid.style.backgroundSize = 'cover';
    grid.classList.add('grid-bg-dark');
  };
  r.readAsDataURL(f);
});
resetGridBackgroundBtn.addEventListener('click', () => {
  grid.style.backgroundImage = '';
  grid.classList.remove('grid-bg-dark');
});

// init tracker
function addInitEntry(name, score) {
  const id = 'init' + (initIdCounter++);
  const entry = document.createElement('div');
  entry.className = 'init-entry';
  entry.dataset.initId = id;
  entry.innerHTML = `
    <input type="number" class="init-score" value="${score ?? 10}" style="width:34px;">
    <input type="text" class="init-name" value="${name ?? ''}" placeholder="Name" style="flex:1;">
    <button class="init-del" title="Remove">✕</button>
  `;
  initEntriesEl.appendChild(entry);
  entry.querySelector('.init-del').addEventListener('click', () => {
    entry.remove();
    const kids = [...initEntriesEl.children];
    if (currentInitIndex >= kids.length) currentInitIndex = kids.length - 1;
    highlightTurn();
  });
}
function highlightTurn() {
  document.querySelectorAll('.token .turn-ring').forEach(r => r.remove());
  [...initEntriesEl.children].forEach((e,i) => e.classList.toggle('current', i===currentInitIndex));
  if (currentInitIndex < 0) return;
  const active = initEntriesEl.children[currentInitIndex];
  if (!active) return;
  const name = active.querySelector('.init-name').value.trim().toLowerCase();
  document.querySelectorAll('.token').forEach(t => {
    if ((t.dataset.name||'').trim().toLowerCase() === name) {
      const ring = document.createElement('div'); ring.className = 'turn-ring'; t.appendChild(ring);
    }
  });
}
initAddBtn.addEventListener('click',  () => addInitEntry('', 10));
initSortBtn.addEventListener('click', () => {
  [...initEntriesEl.children].sort((a,b) =>
    +b.querySelector('.init-score').value - +a.querySelector('.init-score').value
  ).forEach(e => initEntriesEl.appendChild(e));
  currentInitIndex = -1; highlightTurn();
  showToast('Initiative sorted');
});
initNextBtn.addEventListener('click', () => {
  const n = initEntriesEl.children.length;
  if (!n) { showToast('Add combatants first'); return; }
  currentInitIndex = (currentInitIndex+1) % n;
  highlightTurn();
  showToast('Turn: ' + (initEntriesEl.children[currentInitIndex].querySelector('.init-name').value || 'Unnamed'));
});

// save load and other bs
function serialize() {
  return {
    version: 3,
    cols: gridCols, rows: gridRows, sq: baseSquareSize,
    gridBg: grid.style.backgroundImage || '',
    pageBg: document.body.style.backgroundImage || '',
    tokens: [...document.querySelectorAll('.token')].map(t => ({
      id: t.dataset.tokenId, name: t.dataset.name, hp: t.dataset.hp, hpmax: t.dataset.hpmax, effects: t.dataset.effects,
      left: t.style.left, top: t.style.top, width: t.style.width, height: t.style.height,
      bg: t.style.background, color: t.style.color, br: t.style.borderRadius, fs: t.style.fontSize, z: t.style.zIndex
    })),
    walls: [...document.querySelectorAll('.wall')].map(w => ({
      left: w.style.left, top: w.style.top, width: w.style.width, transform: w.style.transform
    })),
    initiative: [...initEntriesEl.children].map(e => ({
      name: e.querySelector('.init-name').value, score: e.querySelector('.init-score').value
    }))
  };
}
function deserialize(data) {
  document.querySelectorAll('.token,.wall').forEach(el => el.remove());
  tokenListEntries.innerHTML = ''; initEntriesEl.innerHTML = '';
  selectedTokens.clear(); undoStack = []; redoStack = []; refreshUndoRedo();
  currentInitIndex = -1;

  if (data.cols) { gridCols = data.cols; colsInput.value = data.cols; }
  if (data.rows) { gridRows = data.rows; rowsInput.value = data.rows; }
  if (data.sq)   { baseSquareSize = data.sq; }
  applyGridSize();

  if (data.gridBg) { grid.style.backgroundImage = data.gridBg; grid.style.backgroundSize='cover'; grid.classList.add('grid-bg-dark'); }
  if (data.pageBg) { document.body.style.backgroundImage = data.pageBg; document.body.style.backgroundSize='cover'; }

  (data.tokens||[]).forEach(td => {
    const token = document.createElement('div');
    token.className = 'token';
    token.dataset.tokenId = td.id || ('tok'+(tokenIdCounter++));
    Object.assign(token.dataset, { name:td.name||'', hp:td.hp||'', hpmax:td.hpmax||'', effects:td.effects||'' });
    Object.assign(token.style, { left:td.left, top:td.top, width:td.width, height:td.height,
      background:td.bg, color:td.color, borderRadius:td.br, fontSize:td.fs, zIndex:td.z });
    attachTokenEvents(token);
    grid.appendChild(token);
    renderTokenBadges(token);
    addTokenListEntry(token);
  });
  (data.walls||[]).forEach(wd => {
    const wall = document.createElement('div');
    wall.className = 'wall';
    Object.assign(wall.style, { left:wd.left, top:wd.top, width:wd.width, transform:wd.transform });
    grid.appendChild(wall);
  });
  (data.initiative||[]).forEach(id => addInitEntry(id.name, id.score));
}

saveSceneBtn.addEventListener('click', () => {
  try { localStorage.setItem('combatGrid_scene', JSON.stringify(serialize())); showToast('Scene saved'); }
  catch { showToast('Save failed (storage full?)'); }
});
loadSceneBtn.addEventListener('click', () => {
  const raw = localStorage.getItem('combatGrid_scene');
  if (!raw) { showToast('No saved scene found'); return; }
  try { deserialize(JSON.parse(raw)); showToast('Scene loaded'); }
  catch { showToast('Load failed (corrupt data)'); }
});
exportSceneBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(serialize(),null,2)], {type:'application/json'});
  const a = Object.assign(document.createElement('a'), { href:URL.createObjectURL(blob), download:'combat-grid.json' });
  a.click(); URL.revokeObjectURL(a.href);
  showToast('Scene exported');
});
importSceneInput.addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => { try { deserialize(JSON.parse(ev.target.result)); showToast('Scene imported'); } catch { showToast('Import failed'); } };
  r.readAsText(f); e.target.value = '';
});

// side panel toggle/drag
const tokenListPanel   = document.getElementById('token-list');
const initiativePanel  = document.getElementById('initiative-panel');
const toggleTokenBtn   = document.getElementById('toggle-token-list');
const toggleInitBtn    = document.getElementById('toggle-initiative');
const closeTokenListBtn= document.getElementById('close-token-list');
const closeInitBtn     = document.getElementById('close-initiative');

function setPanelVisible(panel, visible, toggleBtn, label) {
  panel.style.display = visible ? 'block' : 'none';
  if (toggleBtn) {
    toggleBtn.textContent = visible ? label + '' : label + '';
    toggleBtn.style.background = visible ? '#446644' : '#555';
  }
}

toggleTokenBtn.addEventListener('click', () => {
  const visible = tokenListPanel.style.display !== 'none';
  setPanelVisible(tokenListPanel, !visible, toggleTokenBtn, 'Tokens');
});
toggleInitBtn.addEventListener('click', () => {
  const visible = initiativePanel.style.display !== 'none';
  setPanelVisible(initiativePanel, !visible, toggleInitBtn, 'Initiative');
});
closeTokenListBtn.addEventListener('click', () => setPanelVisible(tokenListPanel, false, toggleTokenBtn, 'Tokens'));
closeInitBtn.addEventListener('click',      () => setPanelVisible(initiativePanel, false, toggleInitBtn, 'Initiative'));

makeDraggable(document.getElementById('token-list-header'),  tokenListPanel);
makeDraggable(document.getElementById('initiative-header'),  initiativePanel);

// set initial button labels
toggleTokenBtn.textContent = 'Tokens';
toggleTokenBtn.style.background = '#446644';
toggleInitBtn.textContent = 'Initiative';
toggleInitBtn.style.background = '#446644';

// run
grid.style.setProperty('--zoom', zoom);
applyGridSize();
refreshUndoRedo();