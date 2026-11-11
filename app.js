/* ==========================================================================
   MICAELA AILÉN GODOY — PORTFOLIO AUDIOVISUAL
   Interactive Controller: Video Modal, Color Grading Split Slider, Lightbox,
   Project Filters, Software Tabs, CV Viewer, and Contact Handlers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initColorGradingSlider();
  initProjectFilters();
  initPhotoFilters();
  initVerticalReels();
  initSoftwareTabs();
  initCvModals();
  initKeyboardShortcuts();
});

/* ==================== MOBILE NAVIGATION ==================== */
function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('drawerCloseBtn');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (menuBtn && drawer) {
    // Always start closed. This prevents a restored/stale browser state
    // from leaving the drawer visible when the page is loaded.
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');

    const setDrawerState = (isOpen) => {
      drawer.classList.toggle('open', isOpen);
      drawer.setAttribute('aria-hidden', String(!isOpen));
      menuBtn.setAttribute('aria-expanded', String(isOpen));

      // Prevent the page underneath from scrolling while the drawer is open.
      // Use a class instead of overwriting an existing inline overflow rule.
      document.documentElement.classList.toggle('drawer-open', isOpen);
      document.body.classList.toggle('drawer-open', isOpen);
    };

    menuBtn.addEventListener('click', () => {
      setDrawerState(!drawer.classList.contains('open'));
    });

    closeBtn?.addEventListener('click', () => {
      setDrawerState(false);
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        setDrawerState(false);
      });
    });

    // Close the drawer when the browser navigates via a hash.
    window.addEventListener('hashchange', () => setDrawerState(false));

    // Escape closes the drawer.
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && drawer.classList.contains('open')) {
        setDrawerState(false);
        menuBtn.focus();
      }
    });

    // If the viewport becomes desktop-sized while the drawer is open,
    // force it closed and restore page scrolling.
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && drawer.classList.contains('open')) {
        setDrawerState(false);
      }
    });
  }
}

/* ==================== VIDEO MODAL CONTROLLER ==================== */
function openVideoModal(videoId, title, roles) {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoIframe');
  const titleEl = document.getElementById('videoModalTitle');
  const rolesEl = document.getElementById('videoModalRoles');

  if (modal && iframe) {
    if (titleEl) titleEl.textContent = title || 'Proyecto Audiovisual';
    if (rolesEl) rolesEl.textContent = roles ? `Roles: ${roles}` : '';

    // Autoplay embed URL
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoIframe');

  if (modal && iframe) {
    iframe.src = ''; // Stops video immediately
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Click outside to close video modal
document.getElementById('videoModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'videoModal') {
    closeVideoModal();
  }
});

/* ==================== COLOR GRADING SPLIT SLIDER ==================== */
function initColorGradingSlider() {
  const sliderBox = document.getElementById('colorSliderBox');
  const afterLayer = document.getElementById('afterLayer');
  const divider = document.getElementById('sliderDivider');
  const beforeImg = document.getElementById('beforeImg');
  const gradedImg = document.getElementById('gradedImg');
  const shotBtns = document.querySelectorAll('.shot-btn');

  if (!sliderBox || !afterLayer || !divider) return;

  let isDragging = false;

  function updateSliderPosition(clientX) {
    const rect = sliderBox.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    let percentage = (offsetX / rect.width) * 100;

    // Constrain within 0% to 100%
    percentage = Math.max(0, Math.min(100, percentage));

    divider.style.left = `${percentage}%`;
    afterLayer.style.clipPath = `polygon(${percentage}% 0, 100% 0, 100% 100%, ${percentage}% 100%)`;
  }

  // Mouse Events
  sliderBox.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSliderPosition(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Events
  sliderBox.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches.length > 0) {
      updateSliderPosition(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length === 0) return;
    updateSliderPosition(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Shot Selector Buttons — scroll carousel
  const projectLabel = document.getElementById('colorProjectLabel');
  shotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      shotBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const beforeSrc = btn.getAttribute('data-before');
      const afterSrc = btn.getAttribute('data-after');

      if (beforeImg && beforeSrc) {
        beforeImg.src = beforeSrc;
      }
      if (gradedImg && afterSrc) {
        gradedImg.src = afterSrc;
      }
      // projectLabel may not exist in new layout — guard safely
      if (projectLabel) {
        const projectText = btn.getAttribute('data-project');
        if (projectText) {
          projectLabel.innerHTML = `<i class="fa-solid fa-clapperboard"></i> Proyecto: <strong>${projectText}</strong>`;
        }
      }
    });
  });
}

/* ==================== PROJECT CATEGORY FILTERS ==================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-editorial-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInCard 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==================== PHOTO GALLERY TABS & LIGHTBOX ==================== */
function initPhotoFilters() {
  const photoTabs = document.querySelectorAll('.photo-tab-btn');
  const photoCards = document.querySelectorAll('.scrapbook-photo-card');

  photoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      photoTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const pfilter = tab.getAttribute('data-pfilter');

      photoCards.forEach(card => {
        if (pfilter === 'all' || card.classList.contains(`p-${pfilter}`)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

let currentGallery = [];
let currentGalleryIndex = 0;

function openGalleryLightbox(images, initialIndex = 0) {
  if (!Array.isArray(images) || images.length === 0) return;
  currentGallery = images;
  currentGalleryIndex = initialIndex;
  renderLightboxSlide();

  const modal = document.getElementById('photoLightboxModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function openLightbox(src, title, desc) {
  openGalleryLightbox([{ src, title: title || 'Fotografía', desc: desc || '' }], 0);
}

function renderLightboxSlide() {
  const item = currentGallery[currentGalleryIndex];
  if (!item) return;

  const img = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');
  const descEl = document.getElementById('lightboxDesc');
  const counterEl = document.getElementById('lightboxCounter');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');
  const thumbsTrack = document.getElementById('lightboxThumbsTrack');

  if (img) {
    img.src = item.src;
    img.alt = item.title || 'Fotografía';
  }
  if (titleEl) titleEl.textContent = item.title || 'Fotografía';
  if (descEl) descEl.textContent = item.desc || '';

  if (counterEl) {
    if (currentGallery.length > 1) {
      counterEl.style.display = 'inline-block';
      counterEl.textContent = `${currentGalleryIndex + 1} / ${currentGallery.length}`;
    } else {
      counterEl.style.display = 'none';
    }
  }

  if (prevBtn && nextBtn) {
    if (currentGallery.length > 1) {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    } else {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  }

  // Render thumbnail strip
  if (thumbsTrack) {
    if (currentGallery.length > 1) {
      thumbsTrack.style.display = 'flex';
      thumbsTrack.innerHTML = currentGallery.map((photo, idx) => `
        <button class="lightbox-thumb-btn ${idx === currentGalleryIndex ? 'active' : ''}" onclick="selectGalleryIndex(${idx})" aria-label="Ver foto ${idx + 1}" title="${photo.title || ''}">
          <img src="${photo.src}" alt="${photo.title || 'Miniatura'}">
        </button>
      `).join('');
    } else {
      thumbsTrack.style.display = 'none';
      thumbsTrack.innerHTML = '';
    }
  }
}

function navigateLightbox(direction) {
  if (currentGallery.length <= 1) return;
  currentGalleryIndex = (currentGalleryIndex + direction + currentGallery.length) % currentGallery.length;
  renderLightboxSlide();
}

function selectGalleryIndex(idx) {
  if (idx >= 0 && idx < currentGallery.length) {
    currentGalleryIndex = idx;
    renderLightboxSlide();
  }
}

function closeLightbox() {
  const modal = document.getElementById('photoLightboxModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

document.getElementById('photoLightboxModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'photoLightboxModal') {
    closeLightbox();
  }
});

/* ==================== SOFTWARE FOLDER TABS ==================== */
function initSoftwareTabs() {
  const folderTabs = document.querySelectorAll('.folder-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  folderTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      folderTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId = `tab-${tab.getAttribute('data-tab')}`;
      tabPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });
}

/* ==================== CURRICULUM VITAE MODAL CONTROLLER ==================== */
function initCvModals() {
  const openCvBtn = document.getElementById('openCvBtn');
  const openCvBtnMobile = document.getElementById('openCvBtnMobile');
  const viewCvModalBtn = document.getElementById('viewCvModalBtn');
  const downloadCvDirectBtn = document.getElementById('downloadCvDirectBtn');

  openCvBtn?.addEventListener('click', openCvModal);
  openCvBtnMobile?.addEventListener('click', openCvModal);
  viewCvModalBtn?.addEventListener('click', openCvModal);

  downloadCvDirectBtn?.addEventListener('click', () => {
    openCvModal();
    setTimeout(() => {
      window.print();
    }, 400);
  });
}

function openCvModal() {
  const modal = document.getElementById('cvModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeCvModal() {
  const modal = document.getElementById('cvModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

document.getElementById('cvModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'cvModal') {
    closeCvModal();
  }
});

/* ==================== CONTACT FORM & COPY TO CLIPBOARD ==================== */
function handleContactSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('senderName')?.value;
  const email = document.getElementById('senderEmail')?.value;
  const projectType = document.getElementById('projectType')?.value;
  const message = document.getElementById('senderMessage')?.value;

  const subject = encodeURIComponent(`[Portfolio] Consulta de ${name} — ${projectType}`);
  const body = encodeURIComponent(`Hola Micaela,\n\nSoy ${name} (${email}).\nTipo de proyecto: ${projectType}\n\nDetalles:\n${message}\n\nSaludos!`);

  window.location.href = `mailto:micaela.agd@gmail.com?subject=${subject}&body=${body}`;

  showToast('¡Gracias por tu mensaje! Se ha preparado tu cliente de correo.');
  event.target.reset();
}

function copyEmailToClipboard(email) {
  navigator.clipboard.writeText(email).then(() => {
    showToast('¡Correo copiado al portapapeles: ' + email + '!');
  }).catch(() => {
    showToast('Correo: ' + email);
  });
}

/* Toast Notification Utility */
function showToast(text) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `<i class="fa-solid fa-sparkles"></i> <span>${text}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

/* ==================== VERTICAL VIDEOS & BRANDING CONTROLLER ==================== */
const REELS_DATA = [
  {
    youtubeId: 'nTGD0iZsrvk',
    title: 'Cuidado & Glow Facial',
    brand: 'Beauty Studio By Roxy',
    desc: 'Tratamientos estéticos con iluminación difusa, planos macro y corrección de color cálida para realzar los tonos de piel.',
    quality: '4K UHD',
    duration: '0:45 min',
    roles: ['Dirección de Fotografía', 'Grabación en Set', 'Color Grading']
  },
  {
    youtubeId: '3F0YJTvlDt4',
    title: 'Detalle & Proceso en Cabina',
    brand: 'Social Media & Branding',
    desc: 'Montaje ágil con transiciones dinámicas y sincronización rítmica diseñada para captar la atención de la audiencia en los primeros segundos.',
    quality: '2K HD',
    duration: '0:24 min',
    roles: ['Grabación', 'Montaje Dinámico', 'Ritmo Fílmico']
  },
  {
    youtubeId: 'UbBe7FOP0DI',
    title: 'Experiencia de Cliente & Cabina',
    brand: 'Beauty Studio By Roxy',
    desc: 'Storytelling visual enfocado en la armonía del espacio de trabajo, aplicación de productos y calidez en el trato profesional.',
    quality: '1080p FHD',
    duration: '0:35 min',
    roles: ['Dirección', 'Cámara', 'Edición & Storytelling']
  },
  {
    youtubeId: 'TfVmDhWX1fs',
    title: 'Sesión Completa & Técnica',
    brand: 'Branding Integral • Beauty Studio',
    desc: 'Registro paso a paso con seguimiento de producto, texturas y montaje narrativo de principio a fin.',
    quality: '4K UHD',
    duration: '1:00 min',
    roles: ['Grabación en Set', 'Edición Completa', 'Color Grading']
  },
  {
    youtubeId: '6E8dREhyjS4',
    title: 'Showcase de Resultados & Estilo',
    brand: 'Beauty Studio By Roxy',
    desc: 'Presentación final con movimiento de cámara fluido, elegancia y grading de alto impacto visual.',
    quality: '4K UHD',
    duration: '0:32 min',
    roles: ['Cámara Fílmica', 'Color Grading', 'Montaje']
  }
];

let currentModalReelIndex = 0;

function initVerticalReels() {
  const track = document.getElementById('reelsCarouselTrack');
  const prevBtn = document.getElementById('reelsScrollPrev');
  const nextBtn = document.getElementById('reelsScrollNext');
  const cards = document.querySelectorAll('.reel-card');
  const dots = document.querySelectorAll('.reel-dot');

  if (!track) return;

  const youtubeOrigin = window.location.origin;

  function youtubeCommand(iframe, func, args = []) {
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func,
      args
    }), 'https://www.youtube-nocookie.com');
  }

  function pauseOtherCards(currentCard) {
    document.querySelectorAll('.reel-youtube-frame').forEach(frame => {
      const otherCard = frame.closest('.reel-card');
      if (otherCard && otherCard !== currentCard) {
        youtubeCommand(frame, 'pauseVideo');
        otherCard.classList.remove('is-playing');
      }
    });
  }

  function playCard(card) {
    const iframe = card.querySelector('.reel-youtube-frame');
    if (!iframe) return;
    pauseOtherCards(card);

    // Lazy load iframe src on demand if not loaded yet
    if (!iframe.src && iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
      card.classList.add('is-playing');
      return;
    }

    youtubeCommand(iframe, 'unMute');
    youtubeCommand(iframe, 'setVolume', [50]);
    youtubeCommand(iframe, 'playVideo');
    card.classList.add('is-playing');
  }

  function pauseCard(card) {
    const iframe = card.querySelector('.reel-youtube-frame');
    if (!iframe) return;
    if (iframe.src) {
      youtubeCommand(iframe, 'pauseVideo');
    }
    card.classList.remove('is-playing');
  }

  function toggleFullscreen(element) {
    if (!element) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      exit?.call(document);
      return;
    }
    const request = element.requestFullscreen || element.webkitRequestFullscreen;
    request?.call(element);
  }

  // Navigation arrows
  prevBtn?.addEventListener('click', () => {
    const cardWidth = cards[0] ? cards[0].offsetWidth + 26 : 330;
    track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  });
  nextBtn?.addEventListener('click', () => {
    const cardWidth = cards[0] ? cards[0].offsetWidth + 26 : 330;
    track.scrollBy({ left: cardWidth, behavior: 'smooth' });
  });

  // Pagination dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      if (cards[idx]) cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  // Active dot on scroll
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const trackCenter = track.scrollLeft + track.offsetWidth / 2;
      let closestIdx = 0;
      let minDistance = Infinity;
      cards.forEach((card, idx) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(trackCenter - cardCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
    }, 50);
  }, { passive: true });

  // YouTube card interactions. Videos stay paused until the visitor presses Play.
  cards.forEach(card => {
    const iframe = card.querySelector('.reel-youtube-frame');
    const playBtn = card.querySelector('.youtube-reel-play-btn');
    const expandBtn = card.querySelector('.youtube-reel-expand-btn');
    const index = parseInt(card.getAttribute('data-index') || '0', 10);

    if (!iframe) return;

    const data = REELS_DATA[index];
    if (data && !iframe.dataset.src) {
      iframe.dataset.src = `https://www.youtube-nocookie.com/embed/${data.youtubeId}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(youtubeOrigin)}`;
    }

    playBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      playCard(card);
    });

    iframe.addEventListener('load', () => {
      // Keep the player muted/paused on first load. The visitor controls playback.
      youtubeCommand(iframe, 'mute');
      youtubeCommand(iframe, 'setVolume', [50]);
      youtubeCommand(iframe, 'pauseVideo');
    });

    expandBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      pauseCard(card);
      openReelModal(index);
    });

    // Clicking the video itself also acts as Play/Pause without exposing YouTube's controls.
    card.querySelector('.reel-video-wrapper')?.addEventListener('click', (e) => {
      if (e.target.closest('.youtube-reel-play-btn') || e.target.closest('.youtube-reel-expand-btn')) return;
      if (card.classList.contains('is-playing')) pauseCard(card);
      else playCard(card);
    });
  });

  // Pause embedded players when their card leaves the viewport.
  if ('IntersectionObserver' in window) {
    const reelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.target.classList.contains('is-playing')) {
          pauseCard(entry.target);
        }
      });
    }, { threshold: 0.3 });
    cards.forEach(card => reelObserver.observe(card));
  }

  // Mouse drag to scroll horizontally on desktop
  let isDown = false;
  let startX;
  let scrollLeft;
  track.addEventListener('mousedown', (e) => {
    if (e.target.closest('button') || e.target.closest('.reel-youtube-frame')) return;
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', () => { isDown = false; });
  track.addEventListener('mouseup', () => { isDown = false; });
  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
}

/* ==================== REEL LIGHTBOX MODAL ==================== */
function openReelModal(index = 0) {
  currentModalReelIndex = (index >= 0 && index < REELS_DATA.length) ? index : 0;
  const modal = document.getElementById('reelModal');
  if (!modal) return;

  renderModalReel();
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function renderModalReel() {
  const data = REELS_DATA[currentModalReelIndex];
  if (!data) return;

  const iframe = document.getElementById('modalReelVideo');
  const title = document.getElementById('modalReelTitle');
  const badge = document.getElementById('modalReelBadge');
  const desc = document.getElementById('modalReelDesc');
  const quality = document.getElementById('modalReelQuality');
  const counter = document.getElementById('modalReelCounter');
  const rolesWrap = document.getElementById('modalReelRoles');
  const thumbsWrap = document.getElementById('modalReelThumbs');
  const playBtn = document.getElementById('modalReelPlayBtn');
  const expandBtn = document.getElementById('modalReelExpandBtn');

  if (iframe) {
    iframe.src = `https://www.youtube-nocookie.com/embed/${data.youtubeId}?autoplay=0&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
    iframe.dataset.youtubeId = data.youtubeId;
    iframe.onload = () => {
      youtubeModalCommand('mute');
      youtubeModalCommand('setVolume', [50]);
      youtubeModalCommand('pauseVideo');
    };
  }

  playBtn?.classList.remove('is-playing');
  if (title) title.textContent = data.title;
  if (badge) badge.textContent = data.brand;
  if (desc) desc.textContent = data.desc;
  if (quality) quality.innerHTML = `<i class="fa-solid fa-film"></i> ${data.quality}`;
  if (counter) counter.textContent = `Reel ${currentModalReelIndex + 1} de ${REELS_DATA.length}`;

  if (rolesWrap) rolesWrap.innerHTML = data.roles.map(r => `<span class="tag-item">${r}</span>`).join('');
  if (thumbsWrap) {
    thumbsWrap.innerHTML = REELS_DATA.map((_, i) =>
      `<button class="modal-thumb-dot ${i === currentModalReelIndex ? 'active' : ''}" onclick="openReelModal(${i})" aria-label="Ir a reel ${i + 1}"></button>`
    ).join('');
  }

  if (playBtn) playBtn.onclick = (e) => {
    e.stopPropagation();
    youtubeModalCommand('unMute');
    youtubeModalCommand('setVolume', [50]);
    youtubeModalCommand('playVideo');
    playBtn.classList.add('is-playing');
  };

  if (expandBtn) expandBtn.onclick = (e) => {
    e.stopPropagation();
    const wrap = document.querySelector('.modal-reel-youtube-wrap');
    const request = wrap?.requestFullscreen || wrap?.webkitRequestFullscreen;
    request?.call(wrap);
  };
}

function youtubeModalCommand(func, args = []) {
  const iframe = document.getElementById('modalReelVideo');
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), 'https://www.youtube-nocookie.com');
}

function navigateReelModal(direction) {
  let newIndex = currentModalReelIndex + direction;
  if (newIndex < 0) newIndex = REELS_DATA.length - 1;
  if (newIndex >= REELS_DATA.length) newIndex = 0;
  currentModalReelIndex = newIndex;
  renderModalReel();
}

function closeReelModal() {
  const modal = document.getElementById('reelModal');
  const iframe = document.getElementById('modalReelVideo');
  if (modal) {
    if (iframe) iframe.src = '';
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Click outside reel modal to close
document.getElementById('reelModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'reelModal') {
    closeReelModal();
  }
});

/* ==================== KEYBOARD ACCESSIBILITY ==================== */
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModal();
      closeLightbox();
      closeReelModal();
      closeCvModal();
      document.getElementById('mobileNavDrawer')?.classList.remove('open');
    } else if (e.key === 'ArrowLeft') {
      const photoModal = document.getElementById('photoLightboxModal');
      const reelModal = document.getElementById('reelModal');
      if (photoModal && photoModal.classList.contains('show')) {
        navigateLightbox(-1);
      } else if (reelModal && reelModal.classList.contains('show')) {
        navigateReelModal(-1);
      }
    } else if (e.key === 'ArrowRight') {
      const photoModal = document.getElementById('photoLightboxModal');
      const reelModal = document.getElementById('reelModal');
      if (photoModal && photoModal.classList.contains('show')) {
        navigateLightbox(1);
      } else if (reelModal && reelModal.classList.contains('show')) {
        navigateReelModal(1);
      }
    }
  });
}

