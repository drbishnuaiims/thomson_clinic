document.addEventListener('DOMContentLoaded', initializeDoctorProfile);

function initializeDoctorProfile() {
  const form = document.getElementById('appointment-form');
  if (!form) {
    return;
  }

  const dateInput = form.querySelector('[name="appointment_date"]');
  if (dateInput) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateInput.min = today.toISOString().split('T')[0];
  }

  form.addEventListener('submit', handleAppointmentSubmit);

  const resetButton = document.getElementById('book-another-button');
  if (resetButton) {
    resetButton.addEventListener('click', resetAppointmentForm);
  }
}

function handleAppointmentSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const validation = validateAppointmentForm(form);

  if (!validation.valid) {
    return;
  }

  const appointmentData = {
    doctor_id: getDoctorId(form),
    patient_name: form.elements.patient_name.value.trim(),
    patient_phone: form.elements.patient_phone.value.trim(),
    patient_email: form.elements.patient_email.value.trim(),
    appointment_date: form.elements.appointment_date.value,
    appointment_time: form.elements.appointment_time.value,
    reason: form.elements.reason.value.trim()
  };

  submitAppointment(appointmentData, form);
}

function validateAppointmentForm(form) {
  const fields = {
    patient_name: form.elements.patient_name,
    patient_phone: form.elements.patient_phone,
    patient_email: form.elements.patient_email,
    appointment_date: form.elements.appointment_date,
    appointment_time: form.elements.appointment_time,
    reason: form.elements.reason
  };

  let isValid = true;

  const nameValue = fields.patient_name.value.trim();
  if (!nameValue) {
    setFieldError(form, 'patient_name', 'Please enter your full name.');
    isValid = false;
  } else {
    clearFieldError(form, 'patient_name');
  }

  const phoneValue = fields.patient_phone.value.trim();
  if (!phoneValue || !/^[0-9+()\-\s]{7,20}$/.test(phoneValue)) {
    setFieldError(form, 'patient_phone', 'Please enter a valid mobile number.');
    isValid = false;
  } else {
    clearFieldError(form, 'patient_phone');
  }

  const emailValue = fields.patient_email.value.trim();
  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    setFieldError(form, 'patient_email', 'Please enter a valid email address.');
    isValid = false;
  } else {
    clearFieldError(form, 'patient_email');
  }

  const dateValue = fields.appointment_date.value;
  if (!dateValue) {
    setFieldError(form, 'appointment_date', 'Please select a preferred date.');
    isValid = false;
  } else {
    const selectedDate = new Date(`${dateValue}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setFieldError(form, 'appointment_date', 'Please choose a date in the future.');
      isValid = false;
    } else {
      clearFieldError(form, 'appointment_date');
    }
  }

  if (!fields.appointment_time.value) {
    setFieldError(form, 'appointment_time', 'Please select a preferred time.');
    isValid = false;
  } else {
    clearFieldError(form, 'appointment_time');
  }

  return { valid: isValid, fields };
}

function getDoctorId(form) {
  if (form && form.dataset.doctorId) {
    return form.dataset.doctorId;
  }

  const pageDoctor = document.querySelector('[data-doctor-id]');
  return pageDoctor ? pageDoctor.dataset.doctorId : 'DR001';
}

function submitAppointment(appointmentData, form) {
  const doctorName = document.querySelector('[data-doctor-name]')?.dataset.doctorName || 'Dr Thitta Mohanty';
  const successState = document.getElementById('success-state');
  const doctorField = document.getElementById('success-doctor-name');
  const dateField = document.getElementById('success-date');
  const timeField = document.getElementById('success-time');

  if (doctorField) {
    doctorField.textContent = doctorName;
  }

  if (dateField) {
    dateField.textContent = formatDisplayDate(appointmentData.appointment_date);
  }

  if (timeField) {
    timeField.textContent = formatDisplayTime(appointmentData.appointment_time);
  }

  if (form) {
    form.hidden = true;
    form.setAttribute('aria-hidden', 'true');
  }

  if (successState) {
    successState.hidden = false;
    successState.classList.add('is-visible');
    successState.setAttribute('aria-live', 'polite');
  }

  return appointmentData;
}

function resetAppointmentForm() {
  const form = document.getElementById('appointment-form');
  if (!form) {
    return;
  }

  form.reset();
  form.hidden = false;
  form.setAttribute('aria-hidden', 'false');

  const successState = document.getElementById('success-state');
  if (successState) {
    successState.hidden = true;
    successState.classList.remove('is-visible');
  }

  form.querySelectorAll('.field-error').forEach((error) => {
    error.textContent = '';
  });

  form.querySelectorAll('.form-control').forEach((field) => {
    field.setAttribute('aria-invalid', 'false');
  });

  const dateInput = form.querySelector('[name="appointment_date"]');
  if (dateInput) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateInput.min = today.toISOString().split('T')[0];
  }
}

function setFieldError(form, fieldName, message) {
  const field = form.elements[fieldName];
  const errorContainer = form.querySelector(`[data-error-for="${fieldName}"]`);

  if (field) {
    field.setAttribute('aria-invalid', 'true');
  }

  if (errorContainer) {
    errorContainer.textContent = message;
  }
}

function clearFieldError(form, fieldName) {
  const field = form.elements[fieldName];
  const errorContainer = form.querySelector(`[data-error-for="${fieldName}"]`);

  if (field) {
    field.setAttribute('aria-invalid', 'false');
  }

  if (errorContainer) {
    errorContainer.textContent = '';
  }
}

function formatDisplayDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function formatDisplayTime(value) {
  if (!value) {
    return '';
  }

  const [hours, minutes] = value.split(':');
  const time = new Date();
  time.setHours(Number(hours), Number(minutes), 0, 0);

  return time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
