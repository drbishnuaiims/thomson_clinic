const API_URL =
  'https://script.google.com/macros/s/AKfycbwBlm1hceeXi7SWCu457cbauUsv5qx0tkdDB5mP_XO7GtloDiFg7fnuIW6VhylOacvvXg/exec';

const TOKEN_KEY = 'thomson_google_token';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refreshButton').addEventListener('click', loadAppointments);
  document.getElementById('logoutButton').addEventListener('click', logout);
  loadAppointments();
});

function getGoogleToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

async function loadAppointments() {
  const token = getGoogleToken();

  if (!token) {
    window.location.href = 'doctor-login.html';
    return;
  }

  showMessage('');
  setLoadingState();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'getMyAppointments',
        credential: token
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Unable to load appointments.');
    }

    renderDoctor(result.data.doctor);
    renderAppointments(result.data.appointments || []);
  } catch (error) {
    showMessage(error.message || 'Unable to load appointments.');
    renderEmpty('Unable to load appointments', 'Please refresh or sign in again.');
  }
}

function renderDoctor(doctor) {
  document.getElementById('doctorName').textContent = doctor.name || '';
  document.getElementById('doctorSpeciality').textContent = doctor.speciality || '';
  document.getElementById('doctorMeta').textContent =
    `${doctor.designation || ''} · ${doctor.doctor_id || ''}`.replace(/^ · | · $/g, '');
}

function renderAppointments(appointments) {
  const list = document.getElementById('appointmentList');

  const counts = {
    total: appointments.length,
    pending: 0,
    confirmed: 0,
    completed: 0
  };

  appointments.forEach(item => {
    const status = String(item.status || '').toUpperCase();
    if (status === 'PENDING') counts.pending++;
    if (status === 'CONFIRMED') counts.confirmed++;
    if (status === 'COMPLETED') counts.completed++;
  });

  document.getElementById('totalCount').textContent = counts.total;
  document.getElementById('pendingCount').textContent = counts.pending;
  document.getElementById('confirmedCount').textContent = counts.confirmed;
  document.getElementById('completedCount').textContent = counts.completed;

  if (!appointments.length) {
    renderEmpty('No appointments yet', 'New appointment requests will appear here.');
    return;
  }

  list.innerHTML = appointments.map(renderAppointment).join('');
}

function renderAppointment(item) {
  const status = String(item.status || 'PENDING').toUpperCase();
  const phone = normalizePhone(item.patient_phone);
  const callUrl = phone ? `tel:+${phone}` : '#';
  const whatsappUrl = phone ? `https://wa.me/${phone}` : '#';

  return `
    <article class="appointment">
      <div class="appointment-main">
        <div class="appointment-head">
          <div>
            <h2 class="patient-name">${escapeHtml(item.patient_name)}</h2>
            <p class="reason">${escapeHtml(item.reason || 'No reason provided')}</p>
          </div>
          <span class="status status-${escapeHtml(status)}">${escapeHtml(status)}</span>
        </div>

        <div class="meta">
          <span>${escapeHtml(formatDate(item.appointment_date))}</span>
          <span>${escapeHtml(formatTime(item.appointment_time))}</span>
          <span>${escapeHtml(item.patient_phone || 'No phone')}</span>
        </div>

        <div class="reference">
          Appointment: ${escapeHtml(item.appointment_id || '')}
        </div>
      </div>

      <div class="actions">
        ${
          phone
            ? `<a class="action call-action" href="${callUrl}">Call</a>`
            : ''
        }
        ${
          phone
            ? `<a class="action whatsapp-action" href="${whatsappUrl}" target="_blank" rel="noopener">WhatsApp</a>`
            : ''
        }
      </div>
    </article>
  `;
}

function normalizePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const digits = raw.replace(/\D/g, '');

  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;

  return digits;
}

function formatDate(value) {
  if (!value) return '';
  const parts = String(value).split('-');
  if (parts.length !== 3) return value;

  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatTime(value) {
  if (!value) return '';
  return String(value);
}

function setLoadingState() {
  document.getElementById('appointmentList').innerHTML = `
    <div class="empty-state">
      <div class="empty-title">Loading appointments</div>
      <div class="empty-text">Please wait.</div>
    </div>
  `;
}

function renderEmpty(title, text) {
  document.getElementById('appointmentList').innerHTML = `
    <div class="empty-state">
      <div class="empty-title">${escapeHtml(title)}</div>
      <div class="empty-text">${escapeHtml(text)}</div>
    </div>
  `;
}

function showMessage(message) {
  const element = document.getElementById('message');

  if (!message) {
    element.textContent = '';
    element.classList.add('hidden');
    return;
  }

  element.textContent = message;
  element.classList.remove('hidden');
}

function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem('thomson_doctor');
  window.location.href = 'doctor-login.html';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
