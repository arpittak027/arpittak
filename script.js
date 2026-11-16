/* ==========================================================================
   PORTFOLIO SCRIPTS — LIGHTWEIGHT & FAST
   No external libraries. Zero runtime dependencies.
   ========================================================================== */

(function () {
  'use strict';

  // 1. Dual-Icon Sliding Theme Switch
  const themeSwitch = document.getElementById('theme-switch');
  const storedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  function setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (themeSwitch) {
        themeSwitch.setAttribute('aria-checked', 'false');
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeSwitch) {
        themeSwitch.setAttribute('aria-checked', 'true');
      }
    }
    localStorage.setItem('theme', theme);
  }

  // Initialize theme
  if (storedTheme) {
    setTheme(storedTheme);
  } else if (systemPrefersLight) {
    setTheme('light');
  } else {
    setTheme('dark');
  }

  if (themeSwitch) {
    themeSwitch.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  // Keyboard shortcut: Press 'd' or 'D' to toggle theme (when not in an input)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'd' || e.key === 'D') {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'light' ? 'dark' : 'light');
    }
  });

  // 2. Email Copy Functionality (keeps address confidential until copied)
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function setupCopyButton(btn) {
    if (!btn) return;
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-email') || 'takarpit777@gmail.com';
      const btnText = btn.querySelector('.btn-text');
      const copyIcon = btn.querySelector('.copy-icon');
      const checkIcon = btn.querySelector('.check-icon');
      const originalText = btnText ? btnText.textContent : 'Copy Email';

      try {
        await navigator.clipboard.writeText(email);

        // Update button visual state
        if (btnText) btnText.textContent = 'Copied!';
        if (copyIcon) copyIcon.classList.add('hidden');
        if (checkIcon) checkIcon.classList.remove('hidden');
        btn.classList.add('btn-copied');

        // Show toast
        if (toast) {
          toast.classList.add('show');
          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => {
            toast.classList.remove('show');
          }, 2400);
        }

        // Reset button state
        setTimeout(() => {
          if (btnText) btnText.textContent = originalText;
          if (copyIcon) copyIcon.classList.remove('hidden');
          if (checkIcon) checkIcon.classList.add('hidden');
          btn.classList.remove('btn-copied');
        }, 2200);
      } catch (err) {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  setupCopyButton(document.getElementById('copy-email-btn'));
  setupCopyButton(document.getElementById('copy-email-bottom-btn'));

  // 3. Live Bengaluru Local Time (IST)
  const localTimeEl = document.getElementById('local-time');

  function updateTime() {
    if (!localTimeEl) return;
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      localTimeEl.textContent = `${timeStr} IST (UTC+5:30)`;
    } catch (e) {
      localTimeEl.textContent = 'Bengaluru • UTC+5:30';
    }
  }

  updateTime();
  setInterval(updateTime, 60000);

})();
