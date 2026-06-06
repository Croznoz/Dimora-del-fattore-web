const bookingData = {
  blockedRanges: [
    { start: '2026-05-22', end: '2026-05-25' },
    { start: '2026-06-03', end: '2026-06-06' },
    { start: '2026-06-18', end: '2026-06-20' }
  ],
  bookedRequests: []
};

const state = {
  currentDate: new Date(),
  selectedStart: null,
  selectedEnd: null
};

const elements = {
  calendar: document.getElementById('calendar'),
  monthLabel: document.getElementById('calendar-month'),
  prevMonth: document.getElementById('prev-month'),
  nextMonth: document.getElementById('next-month'),
  checkin: document.getElementById('checkin'),
  checkout: document.getElementById('checkout'),
  summary: document.getElementById('booking-summary'),
  form: document.getElementById('booking-form'),
  message: document.getElementById('form-message')
};

const galleryConfig = [
  {
    src: 'assets/room-suite.jpg',
    alt: 'Suite del Priore con letto, scrivania e vista storica',
    caption: 'La Suite del Priore: ambiente elegante, luce naturale e dettagli contemporanei.'
  },
  {
    src: 'assets/room-granaio.jpg',
    alt: 'Camera del Granaio con travi a vista e atmosfera accogliente',
    caption: 'La Camera del Granaio: alto soffitto rustico, bagno in travertino e comfort intimo.'
  },
  {
    src: 'assets/room-suite-alt.jpg',
    alt: 'Seconda vista della Suite del Priore con letto e scrivania',
    caption: 'Un’altra prospettiva della Suite del Priore, con arredi studiati per il riposo e il lavoro.'
  },
  {
    src: 'assets/room-bathroom.jpg',
    alt: 'Bagno interno in pietra con sanitari moderni',
    caption: 'Bagno privato: finiture chiare e design minimal che esaltano il comfort.'
  },
  {
    src: 'assets/room-courtyard.jpg',
    alt: 'Cortile interno con fontana e luce naturale',
    caption: 'Il cortile interno della Dimora: un angolo di quiete e fascino storico.'
  },
  {
    src: 'assets/room-bathroom-alt.jpg',
    alt: 'Secondo bagno con doccia e linea pulita',
    caption: 'Bagno alternativo della struttura: atmosfera luminosa e materiali naturali.'
  }
];

const galleryElements = {
  modal: document.getElementById('gallery-modal'),
  main: document.getElementById('gallery-main'),
  caption: document.getElementById('gallery-caption'),
  thumbs: document.getElementById('gallery-thumbs'),
  close: document.getElementById('gallery-close')
};

let currentGalleryIndex = 0;

function toIso(date) {
  return date.toISOString().split('T')[0];
}

function formatDate(date) {
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function addDays(date, count) {
  const result = new Date(date.valueOf());
  result.setDate(result.getDate() + count);
  return result;
}

function isInRange(date, start, end) {
  return date >= start && date <= end;
}

function isBlocked(date) {
  const iso = toIso(date);
  return bookingData.blockedRanges.some(range => {
    const start = new Date(range.start);
    const end = new Date(range.end);
    return isInRange(date, start, end);
  });
}

function rangesOverlap(start, end) {
  return bookingData.blockedRanges.some(range => {
    const blockedStart = new Date(range.start);
    const blockedEnd = new Date(range.end);
    return start <= blockedEnd && end >= blockedStart;
  });
}

function updateSummary() {
  if (!state.selectedStart || !state.selectedEnd) {
    elements.summary.innerHTML = '<p><strong>Seleziona le date</strong> per vedere il riepilogo qui.</p>';
    return;
  }

  const nights = Math.round((state.selectedEnd - state.selectedStart) / (1000 * 60 * 60 * 24));
  elements.summary.innerHTML = `
    <p><strong>Check-in:</strong> ${formatDate(state.selectedStart)}</p>
    <p><strong>Check-out:</strong> ${formatDate(state.selectedEnd)}</p>
    <p><strong>Notti:</strong> ${nights}</p>
    <p><strong>Prenotazione:</strong> Intera Struttura (2 Camere)</p>
  `;
}

function getCalendarDays(year, month) {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const firstWeekDay = (monthStart.getDay() + 6) % 7;
  const totalCells = firstWeekDay + monthEnd.getDate();
  const weeks = Math.ceil(totalCells / 7);
  const cells = [];

  for (let i = 0; i < weeks * 7; i += 1) {
    const dayNumber = i - firstWeekDay + 1;
    if (dayNumber < 1 || dayNumber > monthEnd.getDate()) {
      cells.push(null);
    } else {
      cells.push(new Date(year, month, dayNumber));
    }
  }

  return cells;
}

function renderCalendar() {
  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();
  const monthLabel = state.currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  elements.monthLabel.textContent = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  elements.calendar.innerHTML = '';
  const days = getCalendarDays(year, month);

  days.forEach(date => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'calendar-day';

    if (!date) {
      cell.classList.add('disabled');
      cell.disabled = true;
      elements.calendar.appendChild(cell);
      return;
    }

    cell.textContent = date.getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today || isBlocked(date)) {
      cell.classList.add('occupied');
      cell.disabled = true;
    }

    if (toIso(date) === toIso(today)) {
      cell.classList.add('today');
    }

    if (state.selectedStart && toIso(date) === toIso(state.selectedStart)) {
      cell.classList.add('selected');
    }
    if (state.selectedEnd && toIso(date) === toIso(state.selectedEnd)) {
      cell.classList.add('selected');
    }

    if (state.selectedStart && state.selectedEnd && isInRange(date, state.selectedStart, state.selectedEnd)) {
      if (toIso(date) !== toIso(state.selectedStart) && toIso(date) !== toIso(state.selectedEnd)) {
        cell.classList.add('in-range');
      }
    }

    cell.addEventListener('click', () => handleDateClick(date));
    elements.calendar.appendChild(cell);
  });
}

function resetSelection() {
  state.selectedStart = null;
  state.selectedEnd = null;
  elements.checkin.value = '';
  elements.checkout.value = '';
  updateSummary();
  renderCalendar();
}

function handleDateClick(date) {
  if (!state.selectedStart || (state.selectedStart && state.selectedEnd)) {
    state.selectedStart = date;
    state.selectedEnd = null;
    elements.checkin.value = formatDate(date);
    elements.checkout.value = '';
  } else {
    if (date <= state.selectedStart) {
      state.selectedStart = date;
      state.selectedEnd = null;
      elements.checkin.value = formatDate(date);
      elements.checkout.value = '';
    } else {
      if (rangesOverlap(state.selectedStart, date)) {
        elements.message.textContent = 'Il periodo selezionato non è disponibile. Scegli date diverse.';
        return;
      }
      state.selectedEnd = date;
      elements.checkout.value = formatDate(date);
      elements.message.textContent = '';
    }
  }

  updateSummary();
  renderCalendar();
}

function createICS(booking) {
  const dtStart = booking.start.replace(/-/g, '') + 'T150000';
  const dtEnd = booking.end.replace(/-/g, '') + 'T110000';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dimora del Fattore//Booking//IT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@dimoradelfattore.it`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Prenotazione Dimora del Fattore`,
    `DESCRIPTION:Check-in ${formatDate(new Date(booking.start))} - Check-out ${formatDate(new Date(booking.end))}\n${booking.notes}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

function downloadICS(booking) {
  const blob = new Blob([createICS(booking)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `prenotazione-${booking.start}-a-${booking.end}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function handleSubmission(event) {
  event.preventDefault();
  elements.message.textContent = '';

  const name = document.getElementById('guest-name').value.trim();
  const surname = document.getElementById('guest-surname').value.trim();
  const cf = document.getElementById('guest-cf').value.trim().toUpperCase();
  const email = document.getElementById('guest-email').value.trim();
  const arrival = document.getElementById('guest-arrival').value.trim();
  const notes = document.getElementById('guest-notes').value.trim();

  if (!state.selectedStart || !state.selectedEnd) {
    elements.message.textContent = 'Seleziona prima le date di arrivo e partenza.';
    return;
  }

  if (!name || !surname || !cf || !email || !arrival) {
    elements.message.textContent = 'Inserisci tutti i dati obbligatori per inviare la richiesta.';
    return;
  }

  const booking = {
    start: toIso(state.selectedStart),
    end: toIso(state.selectedEnd),
    name: name + ' ' + surname,
    cf,
    email,
    arrival,
    notes
  };

  if (rangesOverlap(state.selectedStart, state.selectedEnd)) {
    elements.message.textContent = 'Il periodo selezionato è già occupato. Scegli altre date.';
    return;
  }

  bookingData.blockedRanges.push({ start: booking.start, end: booking.end });
  bookingData.bookedRequests.push(booking);
  localStorage.setItem('dimoraBookings', JSON.stringify(bookingData.bookedRequests));

  elements.message.textContent = 'Richiesta inviata con successo. Verrai reindirizzato a WhatsApp per inviare la richiesta.';
  elements.message.style.color = 'var(--secondary)';
  downloadICS(booking);

  const whatsappNumber = '393409202855'; // Il tuo numero WhatsApp
  const whatsappMessage = `Richiesta di prenotazione alla Dimora del Fattore confermata!
Di seguito ti trasmetto i miei dati anagrafici e della prenotazione.

Nome e Cognome: ${booking.name}
Codice Fiscale: ${booking.cf}
Orario di arrivo previsto: ${booking.arrival}
Note e richieste: ${booking.notes || 'Nessuna'}

--- Riepilogo Soggiorno ---
Check-in: ${formatDate(new Date(booking.start))}
Check-out: ${formatDate(new Date(booking.end))}
Email: ${booking.email}

⚠️ In allegato a questo messaggio troverai la foto (fronte e retro) del mio documento d'identità valido.`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  window.open(whatsappUrl, '_blank');

  resetFormFields();
  resetSelection();
}

function resetFormFields() {
  document.getElementById('guest-name').value = '';
  document.getElementById('guest-surname').value = '';
  document.getElementById('guest-cf').value = '';
  document.getElementById('guest-email').value = '';
  document.getElementById('guest-arrival').value = '';
  document.getElementById('guest-notes').value = '';
}

function buildGallery() {
  if (!galleryElements.thumbs) return;
  galleryElements.thumbs.innerHTML = galleryConfig.map((item, index) => `
    <button type="button" class="gallery-thumb${index === 0 ? ' selected' : ''}" data-index="${index}" aria-label="Mostra ${item.alt}">
      <img src="${item.src}" alt="${item.alt}">
    </button>
  `).join('');

  galleryElements.thumbs.querySelectorAll('.gallery-thumb').forEach(button => {
    button.addEventListener('click', () => {
      setGalleryImage(Number(button.dataset.index));
    });
  });
}

function setGalleryImage(index) {
  if (!galleryElements.main || !galleryElements.caption) return;
  currentGalleryIndex = index;
  const image = galleryConfig[index];
  galleryElements.main.src = image.src;
  galleryElements.main.alt = image.alt;
  galleryElements.caption.textContent = image.caption;

  if (galleryElements.thumbs) {
    galleryElements.thumbs.querySelectorAll('.gallery-thumb').forEach((thumb, thumbIndex) => {
      thumb.classList.toggle('selected', thumbIndex === index);
    });
  }
}

function openGallery(index) {
  if (!galleryElements.modal) return;
  galleryElements.modal.classList.add('show');
  galleryElements.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setGalleryImage(index);
}

function closeGallery() {
  if (!galleryElements.modal) return;
  galleryElements.modal.classList.remove('show');
  galleryElements.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initGallery() {
  buildGallery();
  document.querySelectorAll('.room-gallery-button').forEach(button => {
    button.addEventListener('click', () => {
      const startIndex = Number(button.dataset.startIndex) || 0;
      openGallery(startIndex);
    });
  });

  document.querySelectorAll('.room-image[data-start-index]').forEach(image => {
    image.addEventListener('click', () => {
      const startIndex = Number(image.dataset.startIndex) || 0;
      openGallery(startIndex);
    });
  });

  galleryElements.close && galleryElements.close.addEventListener('click', closeGallery);
  galleryElements.modal && galleryElements.modal.addEventListener('click', (event) => {
    if (event.target === galleryElements.modal) {
      closeGallery();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && galleryElements.modal && galleryElements.modal.classList.contains('show')) {
      closeGallery();
    }
  });
}

function loadStoredBookings() {
  const stored = localStorage.getItem('dimoraBookings');
  if (!stored) return;
  try {
    bookingData.bookedRequests = JSON.parse(stored);
    bookingData.bookedRequests.forEach(booking => {
      bookingData.blockedRanges.push({ start: booking.start, end: booking.end });
    });
  } catch (error) {
    console.warn('Impossibile caricare le prenotazioni salvate', error);
  }
}

function init() {
  loadStoredBookings();
  updateSummary();
  renderCalendar();
  elements.prevMonth.addEventListener('click', () => {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
  });
  elements.nextMonth.addEventListener('click', () => {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
  });
  elements.form.addEventListener('submit', handleSubmission);
  initGallery();
}

init();

// Lightbox for chalkboard map
(() => {
  const thumb = document.querySelector('.chalkboard-image');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');

  if (!thumb || !lightbox || !lightboxImg) return;

  function openLightbox() {
    lightboxImg.src = thumb.src;
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  thumb.addEventListener('click', openLightbox);
  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('show')) closeLightbox();
  });
})();
