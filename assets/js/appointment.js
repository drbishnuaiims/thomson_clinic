const doctorProfile = {
  id: 'DR001',
  name: 'Dr Thitta Mohanty',
  speciality: 'Respiratory Medicine',
};

const appointmentForm = document.getElementById('appointment-form');
const successCard = document.getElementById('success-card');
const toast = document.getElementById('toast');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2400);
}

function getCurrentDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDoctorIdField() {
  const field = document.getElementById('doctor_id');
  if (field) {
    field.value = doctorProfile.id;
  }
}

function setMinimumDate() {
  const preferredDate = document.getElementById('preferred-date');
  if (preferredDate) {
    preferredDate.min = getCurrentDateString();
  }
}

function validateIndianMobile(mobile) {
  if (!mobile) return false;
  const normalized = mobile.replace(/\s+/g, '').trim();
  const pattern = /^(?:\+?91|0)?[6-9]\d{9}$/;
  return pattern.test(normalized);
}

function validateAppointmentForm(formData) {
  const errors = [];

  if (!formData.patientName || !formData.patientName.trim()) {
    errors.push('Patient name is required.');
  }

  if (!formData.mobile || !validateIndianMobile(formData.mobile)) {
    errors.push('Please enter a valid Indian mobile number.');
  }

  if (!formData.date) {
    errors.push('Preferred date is required.');
  } else {
    const selectedDate = new Date(`${formData.date}T00:00:00`);
    const today = new Date(`${getCurrentDateString()}T00:00:00`);
    if (selectedDate < today) {
      errors.push('Appointment date cannot be in the past.');
    }
  }

  if (!formData.time) {
    errors.push('Preferred time is required.');
  }

  return errors;
}

function buildAppointmentId() {
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `TC-${dateStamp}-${randomSuffix}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function submitAppointment(event) {
  event.preventDefault();

  if (!appointmentForm) return;

  const formData = {
    patientName: appointmentForm.patient_name.value,
    mobile: appointmentForm.mobile.value,
    email: appointmentForm.email.value,
    date: appointmentForm.preferred_date.value,
    time: appointmentForm.preferred_time.value,
    reason: appointmentForm.reason.value,
    doctorId: document.getElementById('doctor_id')?.value || doctorProfile.id,
  };

  const validationErrors = validateAppointmentForm(formData);
  if (validationErrors.length > 0) {
    showToast(validationErrors[0]);
    return;
  }

  const appointmentId = buildAppointmentId();

  successCard.classList.add('visible');
  successCard.innerHTML = `
    <h3>Appointment Request Received</h3>
    <dl>
      <div>
        <dt>Doctor:</dt>
        <dd>${escapeHtml(doctorProfile.name)}</dd>
      </div>
      <div>
        <dt>Date:</dt>
        <dd>${escapeHtml(formData.date)}</dd>
      </div>
      <div>
        <dt>Time:</dt>
        <dd>${escapeHtml(formData.time)}</dd>
      </div>
      <div>
        <dt>Appointment ID:</dt>
        <dd>${escapeHtml(appointmentId)}</dd>
      </div>
    </dl>
  `;

  appointmentForm.reset();
  getDoctorIdField();
  showToast('Appointment request received.');
}

function initAppointmentPage() {
  getDoctorIdField();
  setMinimumDate();

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', submitAppointment);
  }
}

document.addEventListener('DOMContentLoaded', initAppointmentPage);
