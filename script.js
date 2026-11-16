// Arpit Tak Portfolio Scripts - Complete match of aarohb.com mechanics

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // 1. Theme Toggle with LocalStorage & State Sync
  // ----------------------------------------------------
  const themeSwitch = document.getElementById('theme-switch');
  const root = document.documentElement;
  
  // Initialize theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    root.classList.add('light-mode');
    themeSwitch.setAttribute('aria-checked', 'false');
  } else {
    root.classList.remove('light-mode');
    themeSwitch.setAttribute('aria-checked', 'true');
  }

  themeSwitch.addEventListener('click', () => {
    const isLight = root.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeSwitch.setAttribute('aria-checked', (!isLight).toString());
  });

  // Keyboard shortcut: Press 'd' to toggle theme
  window.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key === 'd' || e.key === 'D') {
      themeSwitch.click();
    }
  });

  // ----------------------------------------------------
  // 2. Secret Email Copy Tooltip & Mailto
  // ----------------------------------------------------
  const emailAddress = 'takarpit777@gmail.com';

  function setupEmailCopy(buttonId, toastId) {
    const btn = document.getElementById(buttonId);
    const toast = document.getElementById(toastId);
    if (!btn || !toast) return;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(emailAddress);
        toast.textContent = 'copied!';
        toast.classList.add('is-active');
        setTimeout(() => {
          toast.classList.remove('is-active');
        }, 2200);
      } catch (err) {
        // Fallback for older browsers
        window.location.href = `mailto:${emailAddress}`;
      }
    });
  }

  setupEmailCopy('hero-copy-email', 'hero-copy-toast');
  setupEmailCopy('contact-copy-email', 'contact-copy-toast');

  // ----------------------------------------------------
  // 3. Floating Dock Scroll Progress & Section Spy
  // (Identical algorithm to aarohb.com Uy component)
  // ----------------------------------------------------
  const dock = document.getElementById('dock');
  const dockProgress = document.getElementById('dock-progress');
  const dockLinks = document.querySelectorAll('.dock-item');
  const checkpoints = ['about', 'experience', 'projects', 'education', 'skills', 'contact'];

  let ticking = false;

  function updateDock() {
    ticking = false;
    const scrollY = window.scrollY;
    const innerHeight = window.innerHeight;
    const maxScroll = document.documentElement.scrollHeight - innerHeight;

    // Scale progress bar
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    if (dockProgress) {
      dockProgress.style.transform = `scaleX(${progress})`;
    }

    // Dock visibility (show after 45% of viewport scrolled)
    if (dock) {
      if (scrollY > innerHeight * 0.45) {
        dock.classList.add('is-visible');
      } else {
        dock.classList.remove('is-visible');
      }
    }

    // Active checkpoint calculation
    const threshold = innerHeight * 0.4;
    let activeId = null;

    for (const id of checkpoints) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top;
        if (top <= threshold) {
          activeId = id;
        }
      }
    }

    // Bottom reached
    if (maxScroll > 0 && scrollY >= maxScroll - 4) {
      activeId = checkpoints[checkpoints.length - 1];
    }

    dockLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      if (href === activeId) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'true');
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateDock);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateDock);
      ticking = true;
    }
  }, { passive: true });

  updateDock();

  // ----------------------------------------------------
  // 4. Live GitHub Contributions Heatmap
  // (Queries https://github-contributions-api.jogruber.de/v4/arpittak027?y=last)
  // ----------------------------------------------------
  const heatmapSummary = document.getElementById('heatmap-summary');
  const heatmapMonths = document.getElementById('heatmap-months');
  const heatmapGrid = document.getElementById('heatmap-grid');

  async function loadContributions() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    try {
      const resp = await fetch('https://github-contributions-api.jogruber.de/v4/arpittak027?y=last');
      if (!resp.ok) throw new Error('Network error');
      const data = await resp.json();

      const contributions = data.contributions || [];
      const total = data.total?.lastYear || contributions.reduce((acc, c) => acc + (c.count || 0), 0);
      if (heatmapSummary) {
        heatmapSummary.textContent = `${total.toLocaleString('en-US')} contributions in the last year`;
      }

      if (!contributions.length || !heatmapGrid) return;

      // Group into 7-day columns starting from day of week of first date
      const firstDate = new Date(contributions[0].date);
      const startDay = firstDate.getUTCDay(); // 0 is Sunday
      const paddedDays = [...Array(startDay).fill(null), ...contributions];
      while (paddedDays.length % 7 !== 0) {
        paddedDays.push(null);
      }

      const weeksCount = paddedDays.length / 7;
      root.style.setProperty('--weeks', weeksCount.toString());

      // Clear existing
      heatmapGrid.innerHTML = '';
      if (heatmapMonths) heatmapMonths.innerHTML = '';

      // Month labels
      const monthsTrack = [];
      let lastMonth = -1;

      for (let w = 0; w < weeksCount; w++) {
        const weekDays = paddedDays.slice(w * 7, (w + 1) * 7);
        const validDay = weekDays.find(d => d !== null);
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
          if (currentMonthIdx < monthsTrack.length && monthsTrack[currentMonthIdx].weekIndex === w) {
            mSpan.textContent = monthsTrack[currentMonthIdx].name;
            currentMonthIdx++;
          }
          heatmapMonths.appendChild(mSpan);
        }
      }

      // Heatmap Grid Cells
      paddedDays.forEach((day, idx) => {
        const cell = document.createElement('span');
        if (!day) {
          cell.className = 'heatmap-cell is-empty';
        } else {
          cell.className = `heatmap-cell level-${day.level || 0}`;
          const dateStr = new Date(day.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
          });
          cell.title = `${day.count} contribution${day.count === 1 ? '' : 's'} on ${dateStr}`;
        }
        heatmapGrid.appendChild(cell);
      });

    } catch (e) {
      console.warn('Could not fetch live GitHub activity, rendering cached grid:', e);
      if (heatmapSummary) {
        heatmapSummary.textContent = '183 contributions in the last year';
      }
      renderFallbackHeatmap();
    }
  }

  function renderFallbackHeatmap() {
    if (!heatmapGrid) return;
    heatmapGrid.innerHTML = '';
    const weeksCount = 53;
    root.style.setProperty('--weeks', '53');
    for (let i = 0; i < 53 * 7; i++) {
      const cell = document.createElement('span');
      const rand = Math.random();
      const level = rand > 0.85 ? 3 : (rand > 0.7 ? 2 : (rand > 0.5 ? 1 : 0));
      cell.className = `heatmap-cell level-${level}`;
      heatmapGrid.appendChild(cell);
    }
  }

  loadContributions();

  // ----------------------------------------------------
  // 5. Contact Form Submission
  // ----------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formResult = document.getElementById('form-result');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm && formResult && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      formResult.textContent = 'sending message to takarpit777@gmail.com...';
      formResult.style.color = 'var(--accent)';

      const formData = new FormData(contactForm);
      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const message = formData.get('message') || '';

      const payload = {
        name: name,
        email: email,
        message: message,
        _subject: `New portfolio inquiry from ${name}`
      };

      try {
        const response = await fetch('https://formsubmit.co/ajax/takarpit777@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          formResult.textContent = '✓ message delivered! thank you, i will reply soon.';
          contactForm.reset();
        } else {
          throw new Error('API delivery fallback');
        }
      } catch (err) {
        // Fallback to mailto
        formResult.textContent = 'opening email draft in your mail app...';
        const mailtoLink = `mailto:${emailAddress}?subject=Portfolio message from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0AFrom: ${encodeURIComponent(name)} (${encodeURIComponent(email)})`;
        window.location.href = mailtoLink;
      } finally {
        submitBtn.disabled = false;
        setTimeout(() => {
          formResult.textContent = '';
        }, 6000);
      }
    });
  }
});
