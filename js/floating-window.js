  document.addEventListener('DOMContentLoaded', function () {
    // Функция для открытия сайта в плавающем окне
    window.openFloatingWindow = function(url, title) {
      // Проверка: уже открыто ли окно с этим URL?
      const existing = document.querySelector(`.floating-window[data-url="${url}"]`);
      if (existing) {
        existing.style.zIndex = 10000;
        existing.classList.remove('minimized');
        return existing;
      }

      const win = document.createElement('div');
      win.className = 'floating-window';
      win.dataset.url = url; // Для поиска
      win.innerHTML = `
        <div class="window-header">
          <span>${title}</span>
          <button class="minimize-btn">−</button>
          <button class="close-btn">×</button>
        </div>
        <iframe 
          src="${url}" 
          class="window-body" 
          allow="autoplay; encrypted-media" 
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms">
        </iframe>
        <div class="resize-handle"></div>
      `;

      document.body.appendChild(win);

      const header = win.querySelector('.window-header');
      const minimizeBtn = win.querySelector('.minimize-btn');
      const closeBtn = win.querySelector('.close-btn');
      const resizeHandle = win.querySelector('.resize-handle');

      let isDragging = false;
      let isResizing = false;
      let offsetX, offsetY;

      // --- Перетаскивание ---
      header.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        offsetX = e.clientX - win.getBoundingClientRect().left;
        offsetY = e.clientY - win.getBoundingClientRect().top;
        win.style.cursor = 'grabbing';
        win.style.zIndex = 10000;
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        const maxX = window.innerWidth - win.offsetWidth;
        const maxY = window.innerHeight - win.offsetHeight;
        win.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
        win.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
        win.style.cursor = 'default';
      });

      // --- Изменение размера ---
      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isResizing = true;
      });

      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        e.preventDefault();
        const width = e.clientX - win.getBoundingClientRect().left;
        const height = e.clientY - win.getBoundingClientRect().top;
        win.style.width = Math.max(240, width) + 'px';
        win.style.height = Math.max(200, height) + 'px';
      });

      document.addEventListener('mouseup', () => {
        isResizing = false;
      });

      // --- Сворачивание ---
      minimizeBtn.addEventListener('click', () => {
        if (win.classList.contains('minimized')) {
          win.classList.remove('minimized');
          minimizeBtn.textContent = '−';
        } else {
          win.classList.add('minimized');
          minimizeBtn.textContent = '◻';
        }
      });

      // --- Закрытие ---
      closeBtn.addEventListener('click', () => {
        win.remove();
      });

      // --- Touch поддержка (опционально) ---
      let touchStartX, touchStartY;

      header.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        isDragging = true;
        offsetX = touch.clientX - win.getBoundingClientRect().left;
        offsetY = touch.clientY - win.getBoundingClientRect().top;
        win.style.zIndex = 10000;
        e.preventDefault();
      }, { passive: false });

      document.addEventListener('touchmove', (e) => {
        if (isDragging) {
          const touch = e.touches[0];
          const x = touch.clientX - offsetX;
          const y = touch.clientY - offsetY;
          const maxX = window.innerWidth - win.offsetWidth;
          const maxY = window.innerHeight - win.offsetHeight;
          win.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
          win.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
          e.preventDefault();
        } else if (isResizing) {
          const touch = e.touches[0];
          const width = touch.clientX - win.getBoundingClientRect().left;
          const height = touch.clientY - win.getBoundingClientRect().top;
          win.style.width = Math.max(240, width) + 'px';
          win.style.height = Math.max(200, height) + 'px';
          e.preventDefault();
        }
      }, { passive: false });

      document.addEventListener('touchend', () => {
        isDragging = false;
        isResizing = false;
      });

      resizeHandle.addEventListener('touchstart', (e) => {
        isResizing = true;
        e.preventDefault();
      }, { passive: false });

      return win;
    };

    // Назначаем обработчики на ссылки с data-floating
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-floating]');
      if (!link) return;
      e.preventDefault();
      const url = link.getAttribute('href') || link.dataset.url;
      const title = link.dataset.title || url;
      window.openFloatingWindow(url, title);
    });
  });
