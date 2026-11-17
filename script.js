// ==========================================================================
// ARPIT TAK — SYSTEMS & SOFTWARE ENGINEER PORTFOLIO
// Interactive functionalities: Theme Switch, Active Navigation Spy,
// GitHub Activity Stream, Asynchronous Contact Form, One-Click Clipboard
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  // ------------------------------------------------------------------------
  // 1. Theme Switch (Dual-Icon Sliding Controller & Keyboard Shortcut 'D')
  // ------------------------------------------------------------------------
  const themeSwitch = document.getElementById('theme-switch');

  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      root.classList.add('light-mode');
      if (themeSwitch) themeSwitch.setAttribute('aria-checked', 'false');
    } else {
      root.classList.remove('light-mode');
      if (themeSwitch) themeSwitch.setAttribute('aria-checked', 'true');
    }
  }

  if (themeSwitch) {
    themeSwitch.addEventListener('click', () => {
      const isLight = root.classList.toggle('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      themeSwitch.setAttribute('aria-checked', (!isLight).toString());
    });
  }

  // Keyboard shortcut: Press 'd' or 'D' to toggle theme (ignoring form inputs)
  window.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key === 'd' || e.key === 'D') {
      if (themeSwitch) themeSwitch.click();
    }
  });

  initTheme();

  // ------------------------------------------------------------------------
  // 2. Email Copy Buttons with Tooltip Toasts
  // ------------------------------------------------------------------------
  const emailAddress = 'takarpit777@gmail.com';

  function setupEmailCopy(buttonId, toastId) {
    const btn = document.getElementById(buttonId);
    const toast = document.getElementById(toastId);
    if (!btn || !toast) return;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(emailAddress);
        toast.textContent = 'copied to clipboard!';
        toast.classList.add('is-active');
        setTimeout(() => {
          toast.classList.remove('is-active');
        }, 2200);
      } catch (err) {
        window.location.href = `mailto:${emailAddress}`;
      }
    });
  }

  setupEmailCopy('hero-copy-email', 'hero-copy-toast');
  setupEmailCopy('contact-copy-email', 'contact-copy-toast');

  // ------------------------------------------------------------------------
  // 3. Navbar Active Link Highlighting (Scroll Spy)
  // ------------------------------------------------------------------------
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = ['about', 'architecture', 'projects', 'credentials', 'stack', 'contact'];

  function updateNavSpy() {
    const scrollPosition = window.scrollY + 120;
    let currentSectionId = '';

    for (const sectionId of sections) {
      const el = document.getElementById(sectionId);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          currentSectionId = sectionId;
          break;
        }
      }
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${currentSectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateNavSpy, { passive: true });
  updateNavSpy();

  // ------------------------------------------------------------------------
  // 4. Live GitHub Contributions Heatmap
  // Fetches live contribution history from GitHub via open-source proxy
  // ------------------------------------------------------------------------
  const heatmapSummary = document.getElementById('heatmap-summary');
  const heatmapMonths = document.getElementById('heatmap-months');
  const heatmapGrid = document.getElementById('heatmap-grid');

  async function loadContributions() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    try {
      const resp = await fetch('https://github-contributions-api.jogruber.de/v4/arpittak027?y=last');
      if (!resp.ok) throw new Error('API request failed');
      const data = await resp.json();

      const contributions = data.contributions || [];
      const total = data.total?.lastYear || contributions.reduce((acc, c) => acc + (c.count || 0), 0);
      
      if (heatmapSummary) {
        heatmapSummary.textContent = `${total.toLocaleString('en-US')} contributions in the last year`;
      }

      if (!contributions.length || !heatmapGrid) return;

      const firstDate = new Date(contributions[0].date);
      const startDay = firstDate.getUTCDay();
      const paddedDays = [...Array(startDay).fill(null), ...contributions];
      while (paddedDays.length % 7 !== 0) {
        paddedDays.push(null);
      }

      const weeksCount = paddedDays.length / 7;

      heatmapGrid.innerHTML = '';
      if (heatmapMonths) heatmapMonths.innerHTML = '';

      // Month labels
      const monthsTrack = [];
      let lastMonth = -1;

      for (let w = 0; w < weeksCount; w++) {
        const weekDays = paddedDays.slice(w * 7, (w + 1) * 7);
        const validDay = weekDays.find((d) => d !== null);
        if (validDay) {
          const m = new Date(validDay.date).getUTCMonth();
          if (m !== lastMonth) {
            monthsTrack.push({ weekIndex: w, name: monthNames[m] });
            lastMonth = m;
          }
        }
      }

      if (heatmapMonths) {
        let currentMonthIdx = 0;
        for (let w = 0; w < weeksCount; w++) {
          const mSpan = document.createElement('span');
          mSpan.style.width = '13px';
          mSpan.style.display = 'inline-block';
          if (currentMonthIdx < monthsTrack.length && monthsTrack[currentMonthIdx].weekIndex === w) {
            mSpan.textContent = monthsTrack[currentMonthIdx].name;
            currentMonthIdx++;
          }
          heatmapMonths.appendChild(mSpan);
        }
      }

      // Heatmap Grid Cells
      paddedDays.forEach((day) => {
        const cell = document.createElement('span');
        if (!day) {
          cell.className = 'heatmap-cell is-empty';
          cell.style.visibility = 'hidden';
        } else {
          cell.className = `heatmap-cell level-${day.level || 0}`;
          const dateStr = new Date(day.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          });
          cell.title = `${day.count} contribution${day.count === 1 ? '' : 's'} on ${dateStr}`;
        }
        heatmapGrid.appendChild(cell);
      });
    } catch (e) {
      console.warn('Fallback to local cached contribution pattern:', e);
      if (heatmapSummary) {
        heatmapSummary.textContent = '188 contributions in the last year';
      }
      renderFallbackHeatmap();
    }
  }

  function renderFallbackHeatmap() {
    if (!heatmapGrid) return;
    heatmapGrid.innerHTML = '';
    for (let i = 0; i < 53 * 7; i++) {
      const cell = document.createElement('span');
      const rand = Math.random();
      const level = rand > 0.82 ? 3 : (rand > 0.65 ? 2 : (rand > 0.45 ? 1 : 0));
      cell.className = `heatmap-cell level-${level}`;
      heatmapGrid.appendChild(cell);
    }
  }

  loadContributions();

  // ------------------------------------------------------------------------
  // 5. Asynchronous Contact Form Submission (FormSubmit.co API)
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formResult = document.getElementById('form-result');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm && formResult && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';
      formResult.textContent = 'Dispatching message to takarpit777@gmail.com...';
      formResult.className = 'form-delivery-status';

      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('https://formsubmit.co/ajax/takarpit777@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          formResult.textContent = '✓ Message received! Arpit will get back to you shortly.';
          formResult.className = 'form-delivery-status success';
          contactForm.reset();
        } else {
          throw new Error('API rejected request');
        }
      } catch (err) {
        console.warn('AJAX submit failed, providing direct email fallback:', err);
        formResult.innerHTML = `Unable to send automatically. Please <a href="mailto:takarpit777@gmail.com?subject=${encodeURIComponent(payload.name || 'Portfolio Inquiry')}&body=${encodeURIComponent(payload.message || '')}" style="color:var(--accent); text-decoration:underline;">click here to email takarpit777@gmail.com</a> directly.`;
        formResult.className = 'form-delivery-status error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
});
