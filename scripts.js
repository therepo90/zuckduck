//

// Drag & drop for desktop icons
(function() {
  const container = document.getElementById('desktop-icons');
  let dragIcon = null;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let trashIcon = null;

  // Find the trash icon
  trashIcon = container.querySelector('.icon[data-icon="trash"]');

  function getPointerPosition(e) {
    return { x: e.clientX, y: e.clientY };
  }

  function isOverTrash(x, y) {
    if (!trashIcon) return false;
    const trashRect = trashIcon.getBoundingClientRect();
    return (
      x >= trashRect.left && x <= trashRect.right &&
      y >= trashRect.top && y <= trashRect.bottom
    );
  }

  function onPointerDown(e) {
    if (e.button !== 0) return; // Only left mouse button
    const icon = e.target.closest('.icon');
    if (!icon || icon === trashIcon) return;
    dragIcon = icon;
    dragIcon.classList.add('dragging');
    dragIcon.style.zIndex = 1000;
    isDragging = true;
    document.body.style.userSelect = 'none';
    // Calculate offset relative to icon
    const pointer = getPointerPosition(e);
    const iconRect = dragIcon.getBoundingClientRect();
    offsetX = pointer.x - iconRect.left;
    offsetY = pointer.y - iconRect.top;
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragIcon || !isDragging) return;
    const pointer = getPointerPosition(e);
    const contRect = container.getBoundingClientRect();
    let x = pointer.x - contRect.left - offsetX;
    let y = pointer.y - contRect.top - offsetY;
    x = Math.max(0, Math.min(contRect.width - dragIcon.offsetWidth, x));
    y = Math.max(0, Math.min(contRect.height - dragIcon.offsetHeight, y));
    dragIcon.style.left = x + 'px';
    dragIcon.style.top = y + 'px';
    // Highlight trash if over
    if (isOverTrash(pointer.x, pointer.y)) {
      trashIcon.classList.add('hovered-trash');
    } else {
      trashIcon.classList.remove('hovered-trash');
    }
    e.preventDefault();
  }

  function onPointerUp(e) {
    if (dragIcon) {
      const pointer = getPointerPosition(e);
      if (isOverTrash(pointer.x, pointer.y)) {
        dragIcon.parentNode.removeChild(dragIcon);
      }
      trashIcon.classList.remove('hovered-trash');
      dragIcon.classList.remove('dragging');
      dragIcon.style.zIndex = '';
      dragIcon = null;
      isDragging = false;
      document.body.style.userSelect = '';
      e.preventDefault();
    }
  }

  container.addEventListener('mousedown', onPointerDown);
  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', onPointerUp);
})();
