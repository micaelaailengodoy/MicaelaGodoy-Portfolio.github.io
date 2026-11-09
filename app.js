/* ============================================================================
   MICAELA AILÉN GODOY — PORTFOLIO AUDIOVISUAL
   Interactive behavior for navigation, galleries, reels, modals and contact.
   ============================================================================ */

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

function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  document.getElementById('drawerCloseBtn')?.addEventListener('click', () => drawer?.classList.remove('open'));
  menuBtn?.addEventListener('click', () => drawer?.classList.add('open'));
  document.querySelectorAll('.drawer-link').forEach(link => link.addEventListener('click', () => drawer?.classList.remove('open')));
}

/* Project-video modal */
function openVideoModal(videoId, title, roles) {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoIframe');
  if (!modal || !iframe) return;
  document.getElementById('videoModalTitle').textContent = title || 'Proyecto Audiovisual';
  document.getElementById('videoModalRoles').textContent = roles ? `Roles: ${roles}` : '';
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1`;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoIframe');
  if (modal && iframe) { iframe.src = ''; modal.classList.remove('show'); document.body.style.overflow = ''; }
}
document.getElementById('videoModal')?.addEventListener('click', e => { if (e.target.id === 'videoModal') closeVideoModal(); });

/* Color-grading before/after slider */
function initColorGradingSlider() {
  const box = document.getElementById('colorSliderBox');
  const after = document.getElementById('afterLayer');
  const divider = document.getElementById('sliderDivider');
  if (!box || !after || !divider) return;
  let dragging = false;
  const update = x => {
    const rect = box.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
    divider.style.left = `${pct}%`;
    after.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
  };
  box.addEventListener('mousedown', e => { dragging = true; update(e.clientX); });
  window.addEventListener('mousemove', e => { if (dragging) update(e.clientX); });
  window.addEventListener('mouseup', () => { dragging = false; });
  box.addEventListener('touchstart', e => { dragging = true; if (e.touches[0]) update(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove', e => { if (dragging && e.touches[0]) update(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });
  document.querySelectorAll('.shot-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.shot-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const before = document.getElementById('beforeImg');
    const graded = document.getElementById('gradedImg');
    if (before && btn.dataset.before) before.src = btn.dataset.before;
    if (graded && btn.dataset.after) graded.src = btn.dataset.after;
    const label = document.getElementById('colorProjectLabel');
    if (label && btn.dataset.project) label.textContent = `Proyecto: ${btn.dataset.project}`;
  }));
}

function initProjectFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-editorial-card');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const categories = card.dataset.category || '';
      card.style.display = filter === 'all' || categories.includes(filter) ? 'flex' : 'none';
      if (card.style.display !== 'none') card.style.animation = 'fadeInCard 0.4s ease forwards';
    });
  }));
}

function initPhotoFilters() {
  const tabs = document.querySelectorAll('.photo-tab-btn');
  const cards = document.querySelectorAll('.scrapbook-photo-card');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    cards.forEach(card => { card.style.display = tab.dataset.pfilter === 'all' || card.classList.contains(`p-${tab.dataset.pfilter}`) ? 'block' : 'none'; });
  }));
}

let currentGallery = [];
let currentGalleryIndex = 0;
function openGalleryLightbox(images, initialIndex = 0) {
  if (!Array.isArray(images) || !images.length) return;
  currentGallery = images;
  currentGalleryIndex = initialIndex;
  renderLightboxSlide();
  document.getElementById('photoLightboxModal')?.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function openLightbox(src, title, desc) { openGalleryLightbox([{ src, title: title || 'Fotografía', desc: desc || '' }]); }
function renderLightboxSlide() {
  const item = currentGallery[currentGalleryIndex];
  if (!item) return;
  const img = document.getElementById('lightboxImg');
  if (img) { img.src = item.src; img.alt = item.title || 'Fotografía'; }
  const title = document.getElementById('lightboxTitle');
  const desc = document.getElementById('lightboxDesc');
  if (title) title.textContent = item.title || 'Fotografía';
  if (desc) desc.textContent = item.desc || '';
  const counter = document.getElementById('lightboxCounter');
  if (counter) { counter.style.display = currentGallery.length > 1 ? 'inline-block' : 'none'; counter.textContent = `${currentGalleryIndex + 1} / ${currentGallery.length}`; }
  const prev = document.getElementById('lightboxPrevBtn');
  const next = document.getElementById('lightboxNextBtn');
  if (prev && next) { prev.style.display = next.style.display = currentGallery.length > 1 ? 'flex' : 'none'; }
  const thumbs = document.getElementById('lightboxThumbsTrack');
  if (thumbs) {
    thumbs.style.display = currentGallery.length > 1 ? 'flex' : 'none';
    thumbs.innerHTML = currentGallery.length > 1 ? currentGallery.map((photo, i) => `<button class="lightbox-thumb-btn ${i === currentGalleryIndex ? 'active' : ''}" onclick="selectGalleryIndex(${i})" aria-label="Ver foto ${i + 1}"><img src="${photo.src}" alt="${photo.title || 'Miniatura'}"></button>`).join('') : '';
  }
}
function navigateLightbox(direction) {
  if (currentGallery.length < 2) return;
  currentGalleryIndex = (currentGalleryIndex + direction + currentGallery.length) % currentGallery.length;
  renderLightboxSlide();
}
function selectGalleryIndex(index) { if (index >= 0 && index < currentGallery.length) { currentGalleryIndex = index; renderLightboxSlide(); } }
function closeLightbox() { document.getElementById('photoLightboxModal')?.classList.remove('show'); document.body.style.overflow = ''; }
document.getElementById('photoLightboxModal')?.addEventListener('click', e => { if (e.target.id === 'photoLightboxModal') closeLightbox(); });

function initSoftwareTabs() {
  const tabs = document.querySelectorAll('.folder-tab');
  const panes = document.querySelectorAll('.tab-pane');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    panes.forEach(pane => pane.classList.toggle('active', pane.id === `tab-${tab.dataset.tab}`));
  }));
}

function initCvModals() {
  document.getElementById('openCvBtn')?.addEventListener('click', openCvModal);
  document.getElementById('openCvBtnMobile')?.addEventListener('click', openCvModal);
  document.getElementById('viewCvModalBtn')?.addEventListener('click', openCvModal);
  document.getElementById('downloadCvDirectBtn')?.addEventListener('click', () => { openCvModal(); setTimeout(() => window.print(), 400); });
}
function openCvModal() { document.getElementById('cvModal')?.classList.add('show'); document.body.style.overflow = 'hidden'; }
function closeCvModal() { document.getElementById('cvModal')?.classList.remove('show'); document.body.style.overflow = ''; }
document.getElementById('cvModal')?.addEventListener('click', e => { if (e.target.id === 'cvModal') closeCvModal(); });

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
  navigator.clipboard.writeText(email).then(() => showToast(`¡Correo copiado al portapapeles: ${email}!`)).catch(() => showToast(`Correo: ${email}`));
}
function showToast(text) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `<i class="fa-solid fa-sparkles"></i> <span>${text}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; toast.style.transition = 'all 0.3s ease'; setTimeout(() => toast.remove(), 300); }, 3500);
}

/* ==================== YOUTUBE SHORTS REELS ==================== */
const REELS_DATA = [
  { id: 'nTGD0iZsrvk', title: 'Cuidado & Glow Facial', brand: 'Beauty Studio By Roxy', desc: 'Tratamientos estéticos con iluminación difusa, planos macro y corrección de color cálida para realzar los tonos de piel.', quality: '4K UHD', duration: '0:45 min', roles: ['Dirección de Fotografía', 'Grabación en Set', 'Color Grading'] },
  { id: '3F0YJTvlDt4', title: 'Detalle & Proceso en Cabina', brand: 'Social Media & Branding', desc: 'Montaje ágil con transiciones dinámicas y sincronización rítmica diseñada para captar la atención de la audiencia en los primeros segundos.', quality: '2K HD', duration: '0:24 min', roles: ['Grabación', 'Montaje Dinámico', 'Ritmo Fílmico'] },
  { id: 'UbBe7FOP0DI', title: 'Experiencia de Cliente & Cabina', brand: 'Beauty Studio By Roxy', desc: 'Storytelling visual enfocado en la armonía del espacio de trabajo, aplicación de productos y calidez en el trato profesional.', quality: '1080p FHD', duration: '0:35 min', roles: ['Dirección', 'Cámara', 'Edición & Storytelling'] },
  { id: 'TfVmDhWX1fs', title: 'Sesión Completa & Técnica', brand: 'Branding Integral • Beauty Studio', desc: 'Registro paso a paso con seguimiento de producto, texturas y montaje narrativo de principio a fin.', quality: '4K UHD', duration: '1:00 min', roles: ['Grabación en Set', 'Edición Completa', 'Color Grading'] },
  { id: '6E8dREhyjS4', title: 'Showcase de Resultados & Estilo', brand: 'Beauty Studio By Roxy', desc: 'Presentación final con movimiento de cámara fluido, elegancia y grading de alto impacto visual.', quality: '4K UHD', duration: '0:32 min', roles: ['Cámara Fílmica', 'Color Grading', 'Montaje'] }
];
let currentModalReelIndex = 0;

function youtubeEmbedUrl(index, autoplay = false) {
  const reel = REELS_DATA[index];
  const params = new URLSearchParams({ autoplay: autoplay ? '1' : '0', mute: '1', controls: '1', playsinline: '1', rel: '0', modestbranding: '1' });
  return `https://www.youtube-nocookie.com/embed/${reel.id}?${params.toString()}`;
}

function initVerticalReels() {
  const track = document.getElementById('reelsCarouselTrack');
  if (!track) return;
  const cards = [...track.querySelectorAll('.reel-card')];
  document.getElementById('reelsScrollPrev')?.addEventListener('click', () => track.scrollBy({ left: -(cards[0]?.offsetWidth + 26 || 330), behavior: 'smooth' }));
  document.getElementById('reelsScrollNext')?.addEventListener('click', () => track.scrollBy({ left: cards[0]?.offsetWidth + 26 || 330, behavior: 'smooth' }));
  document.querySelectorAll('.reel-dot').forEach(dot => dot.addEventListener('click', () => cards[Number(dot.dataset.index)]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })));
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const center = track.scrollLeft + track.offsetWidth / 2;
      let nearest = 0, distance = Infinity;
      cards.forEach((card, i) => { const d = Math.abs(center - (card.offsetLeft + card.offsetWidth / 2)); if (d < distance) { distance = d; nearest = i; } });
      document.querySelectorAll('.reel-dot').forEach((dot, i) => dot.classList.toggle('active', i === nearest));
    }, 60);
  }, { passive: true });

  cards.forEach((card, index) => {
    const reel = REELS_DATA[index];
    if (!reel) return;
    const oldVideo = card.querySelector('.reel-video');
    if (oldVideo) {
      const iframe = document.createElement('iframe');
      iframe.className = 'reel-video';
      iframe.src = youtubeEmbedUrl(index, false); // Never autoplay merely by scrolling to Reels.
      iframe.title = `${reel.title} — YouTube Short`;
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.setAttribute('frameborder', '0');
      oldVideo.replaceWith(iframe);
    }
    // The card's play/expand/sound buttons open the larger player. Playback remains paused
    // until the visitor presses YouTube's native play control in the modal.
    card.querySelector('.reel-play-btn')?.addEventListener('click', e => { e.stopPropagation(); openReelModal(index); });
    card.querySelector('.reel-expand-btn')?.addEventListener('click', e => { e.stopPropagation(); openReelModal(index); });
    card.querySelector('.reel-sound-toggle')?.addEventListener('click', e => { e.stopPropagation(); openReelModal(index); });
    card.querySelector('.reel-progress-track')?.style.setProperty('display', 'none');
    card.querySelector('.reel-time-badge')?.style.setProperty('display', 'none');
  });

  let dragging = false, startX = 0, startScroll = 0;
  track.addEventListener('mousedown', e => { if (e.target.closest('button, iframe')) return; dragging = true; startX = e.pageX - track.offsetLeft; startScroll = track.scrollLeft; });
  track.addEventListener('mouseleave', () => { dragging = false; });
  track.addEventListener('mouseup', () => { dragging = false; });
  track.addEventListener('mousemove', e => { if (dragging) { e.preventDefault(); track.scrollLeft = startScroll - (e.pageX - track.offsetLeft - startX) * 1.5; } });
}

function openReelModal(index = 0) {
  currentModalReelIndex = Math.max(0, Math.min(index, REELS_DATA.length - 1));
  const modal = document.getElementById('reelModal');
  if (!modal) return;
  renderModalReel();
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function renderModalReel() {
  const data = REELS_DATA[currentModalReelIndex];
  if (!data) return;
  const existing = document.getElementById('modalReelVideo');
  if (existing) {
    // Keep playback stopped on open and when switching reels. YouTube's own play/volume
    // controls let the visitor start, unmute and set the volume as desired.
    const iframe = document.createElement('iframe');
    iframe.id = 'modalReelVideo';
    iframe.className = 'modal-reel-video';
    iframe.src = youtubeEmbedUrl(currentModalReelIndex, false);
    iframe.title = `${data.title} — YouTube Short`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('loading', 'eager');
    existing.replaceWith(iframe);
  }
  const setText = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
  setText('modalReelTitle', data.title);
  setText('modalReelBadge', data.brand);
  setText('modalReelDesc', data.desc);
  const quality = document.getElementById('modalReelQuality');
  if (quality) quality.innerHTML = `<i class="fa-solid fa-film"></i> ${data.quality}`;
  const duration = document.getElementById('modalReelDuration');
  if (duration) duration.innerHTML = `<i class="fa-regular fa-clock"></i> ${data.duration}`;
  setText('modalReelCounter', `Reel ${currentModalReelIndex + 1} de ${REELS_DATA.length}`);
  const roles = document.getElementById('modalReelRoles');
  if (roles) roles.innerHTML = data.roles.map(role => `<span class="tag-item">${role}</span>`).join('');
  const thumbs = document.getElementById('modalReelThumbs');
  if (thumbs) thumbs.innerHTML = REELS_DATA.map((_, i) => `<button class="modal-thumb-dot ${i === currentModalReelIndex ? 'active' : ''}" onclick="openReelModal(${i})" aria-label="Ir a reel ${i + 1}"></button>`).join('');
}
function navigateReelModal(direction) {
  currentModalReelIndex = (currentModalReelIndex + direction + REELS_DATA.length) % REELS_DATA.length;
  renderModalReel();
}
function closeReelModal() {
  const iframe = document.getElementById('modalReelVideo');
  if (iframe) iframe.src = 'about:blank';
  document.getElementById('reelModal')?.classList.remove('show');
  document.body.style.overflow = '';
}
document.getElementById('reelModal')?.addEventListener('click', e => { if (e.target.id === 'reelModal') closeReelModal(); });

function initKeyboardShortcuts() {
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeVideoModal(); closeLightbox(); closeReelModal(); closeCvModal();
      document.getElementById('mobileNavDrawer')?.classList.remove('open');
    } else if (e.key === 'ArrowLeft') {
      if (document.getElementById('photoLightboxModal')?.classList.contains('show')) navigateLightbox(-1);
      else if (document.getElementById('reelModal')?.classList.contains('show')) navigateReelModal(-1);
    } else if (e.key === 'ArrowRight') {
      if (document.getElementById('photoLightboxModal')?.classList.contains('show')) navigateLightbox(1);
      else if (document.getElementById('reelModal')?.classList.contains('show')) navigateReelModal(1);
    }
  });
}

/* Fit the Shorts iframe to the full portrait player area in the reel modal. */
const reelPlayerFixStyles = document.createElement('style');
reelPlayerFixStyles.textContent = `
  #reelModal .reel-modal-layout { grid-template-columns: minmax(300px, 390px) minmax(0, 1fr); gap: 32px; }
  #reelModal .reel-modal-player-wrap { width: min(100%, 390px); aspect-ratio: 9 / 16; height: auto; max-height: calc(100dvh - 100px); margin-inline: auto; overflow: hidden; }
  #reelModal .modal-reel-video { display: block; width: 100% !important; height: 100% !important; max-height: none !important; aspect-ratio: 9 / 16; border: 0; }
  @media (max-width: 860px) {
    #reelModal .reel-modal-layout { grid-template-columns: minmax(0, 1fr); gap: 20px; }
    #reelModal .reel-modal-player-wrap { width: min(100%, 340px); max-height: 58dvh; }
  }
`;
document.head.appendChild(reelPlayerFixStyles);
