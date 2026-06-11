document.addEventListener("DOMContentLoaded", () => {
  // --- CONTADOR DE TEMPO ---
  const startDate = new Date("2023-12-10T00:00:00");

  const elYears = document.getElementById("t-years");
  const elDays = document.getElementById("t-days");
  const elHours = document.getElementById("t-hours");
  const elMinutes = document.getElementById("t-minutes");
  const elSeconds = document.getElementById("t-seconds");

  function updateTimer() {
    const now = new Date();
    
    let years = now.getFullYear() - startDate.getFullYear();
    const isBeforeAnniversaryThisYear = 
      now.getMonth() < startDate.getMonth() || 
      (now.getMonth() === startDate.getMonth() && now.getDate() < startDate.getDate());
      
    if (isBeforeAnniversaryThisYear) {
      years--;
    }

    const lastAnniversary = new Date(startDate);
    lastAnniversary.setFullYear(startDate.getFullYear() + years);
    
    const timeDiffAfterYears = now.getTime() - lastAnniversary.getTime();
    
    const days = Math.floor(timeDiffAfterYears / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiffAfterYears / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDiffAfterYears / (1000 * 60)) % 60);
    const seconds = Math.floor((timeDiffAfterYears / 1000) % 60);

    if (!document.hidden) {
      if (elYears) elYears.innerText = years;
      if (elDays) elDays.innerText = days;
      if (elHours) elHours.innerText = hours;
      if (elMinutes) elMinutes.innerText = minutes;
      if (elSeconds) elSeconds.innerText = seconds;

      // Atualizar mini contador do Header (se existir)
      const navTimer = document.getElementById("nav-timer");
      if (navTimer) {
        // Formata como "2A 15D 10H" dependendo do espaço. Vamos colocar tudo compacto
        navTimer.innerText = `${years}A ${days}D ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    }

    // Atualizamos a cada 1000ms
    setTimeout(updateTimer, 1000);
  }

  updateTimer();

  // --- INICIALIZAÇÃO DO FANCYBOX ---
  if (typeof Fancybox !== "undefined") {
    Fancybox.bind("[data-fancybox]", {
      Carousel: { transition: "slide" },
      Images: { zoom: false }
    });
  }

  // --- INJEÇÃO DO COMPONENTES DINÂMICOS ---
  function loadComponents() {
    // Header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
      fetch('./src/components/header.html')
        .then(res => res.ok ? res.text() : '')
        .then(html => {
          if (html) headerPlaceholder.innerHTML = html;
        })
        .catch(err => console.error(err));
    }

    // Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      fetch('./src/components/footer.html')
        .then(res => res.ok ? res.text() : '')
        .then(html => {
          if (html) {
            footerPlaceholder.innerHTML = html;
            updateCopyrightYear();
          }
        })
        .catch(err => console.error(err));
    }
  }

  function updateCopyrightYear() {
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
      const currentYear = new Date().getFullYear();
      const startYear = 2026;
      if (currentYear > startYear) {
        yearSpan.textContent = `${startYear} - ${currentYear}`;
      } else {
        yearSpan.textContent = startYear;
      }
    }
  }

  // --- INJEÇÃO DE DATAS NAS IMAGENS (TAG FLUTUANTE) ---
  function initDateTags() {
    const elementsWithDate = document.querySelectorAll('[data-date]');
    elementsWithDate.forEach(el => {
      // Se o usuário colocar o atributo diretamente numa tag <img>, ancoramos no pai dela.
      const targetElement = el.tagName.toLowerCase() === 'img' ? el.parentElement : el;
      
      // Garante que o contêiner consiga segurar a tag absoluta
      const style = window.getComputedStyle(targetElement);
      if (style.position === 'static') {
        targetElement.style.position = 'relative';
      }

      const dateText = el.getAttribute('data-date');
      if (!dateText || targetElement.querySelector('.image-date-tag')) return; // Evita duplicação

      const dateTag = document.createElement('div');
      dateTag.classList.add('image-date-tag');
      
      // Ícone sutil de coração ou calendário do lado da data
      dateTag.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span>${dateText}</span>`;
      
      targetElement.appendChild(dateTag);
    });
  }

  // --- INJEÇÃO DE TOOLTIPS (LEGENDA EM HOVER) ---
  function initTooltips() {
    const elementsWithTooltip = document.querySelectorAll('[data-tooltip]');
    elementsWithTooltip.forEach(el => {
      // Se for uma imagem direta, ancoramos o balão na div pai
      const targetElement = el.tagName.toLowerCase() === 'img' ? el.parentElement : el;
      
      const style = window.getComputedStyle(targetElement);
      if (style.position === 'static') {
        targetElement.style.position = 'relative';
      }

      const tooltipText = el.getAttribute('data-tooltip');
      if (!tooltipText || targetElement.querySelector('.image-tooltip')) return;

      // Adiciona a classe que engatilha o hover no CSS
      targetElement.classList.add('has-tooltip');

      const tooltip = document.createElement('div');
      tooltip.classList.add('image-tooltip');
      tooltip.innerText = tooltipText;
      
      targetElement.appendChild(tooltip);
    });
  }

  // --- REMOÇÃO DO LOADING SCREEN QUANDO TUDO CARREGAR ---
  window.addEventListener('load', () => {
    const loader = document.getElementById('global-loader');
    if (loader) {
      // Espera um segundo adicional proposital para garantir que fontes pesadas carreguem suavemente e o usuário veja a animação
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => loader.remove(), 800); // Remove do DOM após o fade
      }, 500); 
    }
  });

  loadComponents();
  initDateTags();
  initTooltips();

});