const DEMO_APPOINTMENTS = [
  {
    id: 'TC-20261001-0001',
    doctorId: 'DR001',
    patientName: 'Rahul Kumar',
    patientPhone: '919876543210',
    patientEmail: 'rahul@example.com',
    date: '2026-10-02',
    time: '10:30',
    reason: 'Persistent cough and breathing difficulty.',
    status: 'NEW',
    createdAt: '2026-10-01T10:05:00',
  },
  {
    id: 'TC-20261001-0002',
    doctorId: 'DR001',
    patientName: 'Aarav Singh',
    patientPhone: '919912345678',
    patientEmail: 'aarav@example.com',
    date: '2026-10-01',
    time: '14:00',
    reason: 'Wheezing and chest tightness during evening hours.',
    status: 'CONFIRMED',
    createdAt: '2026-10-01T08:20:00',
  },
  {
    id: 'TC-20261001-0003',
    doctorId: 'DR001',
    patientName: 'Neha Sharma',
    patientPhone: '919823456789',
    patientEmail: 'neha@example.com',
    date: '2026-10-05',
    time: '09:15',
    reason: 'Recurrent asthma symptoms and need for follow-up.',
    status: 'RESCHEDULED',
    createdAt: '2026-10-01T09:40:00',
  },
  {
    id: 'TC-20261001-0004',
    doctorId: 'DR001',
    patientName: 'Vikram Nair',
    patientPhone: '919765432109',
    patientEmail: 'vikram@example.com',
    date: '2026-10-03',
    time: '16:45',
    reason: 'Severe breathlessness after exercise.',
    status: 'CANCELLED',
    createdAt: '2026-09-29T15:12:00',
  },
  {
    id: 'TC-20261001-0005',
    doctorId: 'DR001',
    patientName: 'Meera Iyer',
    patientPhone: '919700123456',
    patientEmail: 'meera@example.com',
    date: '2026-09-30',
    time: '11:00',
    reason: 'Review of chronic cough and response to inhaler therapy.',
    status: 'COMPLETED',
    createdAt: '2026-09-28T12:35:00',
  },
];

const STATE = {
  appointments: [],
  activeFilter: 'ALL',
  searchTerm: '',
  selectedAppointmentId: null,
};

const DOCTOR = {
  id: 'DR001',
  name: 'Dr Thitta Mohanty',
  speciality: 'Respiratory Medicine',
};

function safeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => {
    const mapping = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return mapping[char] || char;
  });
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPhoneLink(phoneNumber) {
  const clean = String(phoneNumber || '').replace(/\s+/g, '').trim();
  return `https://wa.me/${clean}`;
}

function getCallLink(phoneNumber) {
  const clean = String(phoneNumber || '').replace(/\s+/g, '').trim();
  return `tel:+${clean}`;
}

function formatDisplayDate(dateValue) {
  if (!dateValue) return '—';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDisplayTime(timeValue) {
  if (!timeValue) return '—';
  return timeValue;
}

function getInitials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || 'PT';
}

function statusClass(status) {
  return `status-${String(status || 'new').toLowerCase()}`;
}

function sortAppointments(appointments) {
  return [...appointments].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

function loadAppointments() {
  if (CONFIG && CONFIG.DEMO_MODE) {
    STATE.appointments = sortAppointments(DEMO_APPOINTMENTS);
    STATE.selectedAppointmentId = STATE.appointments[0]?.id || null;
    return STATE.appointments;
  }

  STATE.appointments = [];
  STATE.selectedAppointmentId = null;
  return STATE.appointments;
}

function filterAppointments() {
  const query = STATE.searchTerm.trim().toLowerCase();

  return STATE.appointments.filter((appointment) => {
    const matchesFilter =
      STATE.activeFilter === 'ALL' || appointment.status === STATE.activeFilter;

    if (!matchesFilter) return false;

    if (!query) return true;

    const haystack = [
      appointment.patientName,
      appointment.patientPhone,
      appointment.id,
      appointment.reason,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

function renderSummaryCards() {
  const today = getTodayDateString();
  const totalToday = STATE.appointments.filter((item) => item.date === today).length;
  const newCount = STATE.appointments.filter((item) => item.status === 'NEW').length;
  const confirmedCount = STATE.appointments.filter((item) => item.status === 'CONFIRMED').length;
  const completedCount = STATE.appointments.filter((item) => item.status === 'COMPLETED').length;

  document.getElementById('summary-today').textContent = totalToday;
  document.getElementById('summary-new').textContent = newCount;
  document.getElementById('summary-confirmed').textContent = confirmedCount;
  document.getElementById('summary-completed').textContent = completedCount;
}

function renderAppointments() {
  const listEl = document.getElementById('appointment-list');
  const filtered = filterAppointments();

  if (!listEl) return;

  if (!filtered.length) {
    listEl.innerHTML = '<li class="empty-state">No appointments found.</li>';
    return;
  }

  listEl.innerHTML = filtered
    .map((appointment) => {
      const isSelected = appointment.id === STATE.selectedAppointmentId ? 'selected' : '';
      const textPreview = appointment.reason || 'No reason provided';
      return `
        <li class="appointment-item ${isSelected}" data-id="${safeText(appointment.id)}" tabindex="0">
          <div class="avatar">${safeText(getInitials(appointment.patientName))}</div>
          <div class="item-main">
            <div class="item-topline">
              <span class="patient-name">${safeText(appointment.patientName)}</span>
            </div>
            <div class="item-time">${safeText(formatDisplayDate(appointment.date))} • ${safeText(appointment.time)}</div>
            <div class="item-preview">${safeText(textPreview)}</div>
          </div>
          <span class="item-status ${statusClass(appointment.status)}">${safeText(appointment.status)}</span>
        </li>
      `;
    })
    .join('');

  listEl.querySelectorAll('.appointment-item').forEach((item) => {
    item.addEventListener('click', () => selectAppointment(item.dataset.id));
  });
}

function renderAppointmentDetail() {
  const detailPanel = document.getElementById('appointment-detail');
  if (!detailPanel) return;

  const selected = STATE.appointments.find((appointment) => appointment.id === STATE.selectedAppointmentId);

  if (!selected) {
    detailPanel.innerHTML = '<div class="detail-empty">Select an appointment to view patient details.</div>';
    return;
  }

  const whatsappLink = getPhoneLink(selected.patientPhone);
  const callLink = getCallLink(selected.patientPhone);

  detailPanel.innerHTML = `
    <button id="mobile-back" class="mobile-back" type="button" aria-label="Go back to appointment list">← Back</button>
    <div class="detail-card">
      <div class="detail-header">
        <div>
          <h2 class="detail-name">${safeText(selected.patientName)}</h2>
          <div class="detail-phone">${safeText(selected.patientPhone)}</div>
        </div>
        <span class="item-status ${statusClass(selected.status)}">${safeText(selected.status)}</span>
      </div>

      <div class="detail-body">
        <section class="message-bubble">
          <div class="message-header">Appointment Request</div>
          <p class="message-text">${safeText(selected.reason || 'No reason provided.')}</p>
        </section>

        <div class="detail-list">
          <div class="detail-row"><span>Date</span><strong>${safeText(formatDisplayDate(selected.date))}</strong></div>
          <div class="detail-row"><span>Time</span><strong>${safeText(formatDisplayTime(selected.time))}</strong></div>
          <div class="detail-row"><span>Phone</span><strong>${safeText(selected.patientPhone)}</strong></div>
          <div class="detail-row"><span>Status</span><strong>${safeText(selected.status)}</strong></div>
        </div>

        <div class="contact-actions">
          <a class="action-btn primary" href="${whatsappLink}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
          <a class="action-btn" href="${callLink}">Call Patient</a>
        </div>

        <div class="appointment-actions">
          <button class="action-btn success" type="button" data-status="CONFIRMED">Confirm</button>
          <button class="action-btn purple" type="button" data-status="RESCHEDULED">Reschedule</button>
          <button class="action-btn danger" type="button" data-status="CANCELLED">Cancel</button>
          <button class="action-btn warning" type="button" data-status="COMPLETED">Mark Completed</button>
        </div>
      </div>
    </div>
  `;

  const backButton = detailPanel.querySelector('#mobile-back');
  if (backButton) {
    backButton.addEventListener('click', () => {
      document.body.dataset.mobileView = 'list';
      syncMobileLayout();
    });
  }

  detailPanel.querySelectorAll('[data-status]').forEach((button) => {
    button.addEventListener('click', () => {
      updateAppointmentStatus(STATE.selectedAppointmentId, button.dataset.status);
    });
  });
}

function syncMobileLayout() {
  const listPanel = document.querySelector('.list-panel');
  const detailPanel = document.querySelector('.detail-panel');
  if (!listPanel || !detailPanel) return;

  if (window.innerWidth <= 960) {
    const showList = document.body.dataset.mobileView === 'list';
    listPanel.classList.toggle('mobile-hidden', !showList);
    detailPanel.classList.toggle('mobile-hidden', showList);
    return;
  }

  listPanel.classList.remove('mobile-hidden');
  detailPanel.classList.remove('mobile-hidden');
}

function renderAll() {
  renderSummaryCards();
  renderAppointments();
  renderAppointmentDetail();
  syncMobileLayout();
}

function updateAppointmentStatus(appointmentId, newStatus) {
  const appointment = STATE.appointments.find((item) => item.id === appointmentId);
  if (!appointment) return;

  appointment.status = newStatus;
  STATE.appointments = sortAppointments(STATE.appointments);
  renderAll();
  showToast(`Appointment ${newStatus.toLowerCase()}.`);
}

function selectAppointment(appointmentId) {
  STATE.selectedAppointmentId = appointmentId;
  document.body.dataset.mobileView = 'detail';
  renderAppointments();
  renderAppointmentDetail();
  syncMobileLayout();
}

function handleSearchInput(event) {
  STATE.searchTerm = event.target.value;
  renderAppointments();
}

function handleFilterClick(event) {
  const button = event.target.closest('[data-filter]');
  if (!button) return;

  STATE.activeFilter = button.dataset.filter;

  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.filter === STATE.activeFilter);
  });

  renderAppointments();
}

function attachEvents() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
  }

  const filterContainer = document.querySelector('.filter-row');
  if (filterContainer) {
    filterContainer.addEventListener('click', handleFilterClick);
  }

  const listElement = document.getElementById('appointment-list');
  if (listElement) {
    listElement.addEventListener('click', (event) => {
      const item = event.target.closest('.appointment-item');
      if (!item) return;

      const width = window.innerWidth;
      if (width <= 960) {
        document.body.dataset.mobileView = 'detail';
        syncMobileLayout();
      }
    });
  }

  window.addEventListener('resize', syncMobileLayout);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2200);
}

function initializeDashboard() {
  document.body.dataset.mobileView = 'list';
  loadAppointments();
  renderAll();
  attachEvents();

  const firstSelected = STATE.appointments[0];
  if (firstSelected) {
    STATE.selectedAppointmentId = firstSelected.id;
    renderAppointments();
    renderAppointmentDetail();
  }

  const filteredButtons = document.querySelectorAll('.filter-chip');
  filteredButtons.forEach((button) => {
    if (button.dataset.filter === STATE.activeFilter) {
      button.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', initializeDashboard);
