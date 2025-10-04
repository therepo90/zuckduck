//
console.log('hej')

// Drag & drop for desktop icons
(function() {
  const container = document.getElementById('desktop-icons');
  const icons = container.querySelectorAll('.icon');
  let dragIcon = null;
  let offsetX = 0;
  let offsetY = 0;

  icons.forEach(icon => {
    icon.addEventListener('mousedown', function(e) {
      dragIcon = icon;
      dragIcon.classList.add('dragging');
      // Calculate offset between mouse and icon top/left
      const rect = dragIcon.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.body.style.userSelect = 'none';
    });
  });

  document.addEventListener('mousemove', function(e) {
    if (!dragIcon) return;
    // Get container bounds
    const contRect = container.getBoundingClientRect();
    let x = e.clientX - contRect.left - offsetX;
    let y = e.clientY - contRect.top - offsetY;
    // Clamp to container
    x = Math.max(0, Math.min(contRect.width - dragIcon.offsetWidth, x));
    y = Math.max(0, Math.min(contRect.height - dragIcon.offsetHeight, y));
    dragIcon.style.left = x + 'px';
    dragIcon.style.top = y + 'px';
  });

  document.addEventListener('mouseup', function() {
    if (dragIcon) {
      dragIcon.classList.remove('dragging');
      dragIcon = null;
      document.body.style.userSelect = '';
    }
  });
})();
