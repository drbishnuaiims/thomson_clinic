const API_URL =
  'https://script.google.com/macros/s/AKfycbwBlm1hceeXi7SWCu457cbauUsv5qx0tkdDB5mP_XO7GtloDiFg7fnuIW6VhylOacvvXg/exec';

document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('appointment-form');
  const successState = document.getElementById('success-state');
  const bookAnotherButton = document.getElementById('book-another-button');

  if (!form) {
    return;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    clearErrors();

    const doctorId = form.dataset.doctorId;

    const patientName =
      document.getElementById('patient_name').value.trim();

    const patientPhone =
      document.getElementById('patient_phone').value.trim();

    const patientEmail =
      document.getElementById('patient_email').value.trim();

    const appointmentDate =
      document.getElementById('appointment_date').value;

    const appointmentTime =
      document.getElementById('appointment_time').value;

    const reason =
      document.getElementById('reason').value.trim();

    // -----------------------------
    // Frontend validation
    // -----------------------------

    let valid = true;

    if (!patientName) {
      showError('patient_name', 'Please enter your name.');
      valid = false;
    }

    if (!patientPhone) {
      showError('patient_phone', 'Please enter your mobile number.');
      valid = false;
    }

    if (!appointmentDate) {
      showError('appointment_date', 'Please select a preferred date.');
      valid = false;
    }

    if (!appointmentTime) {
      showError('appointment_time', 'Please select a preferred time.');
      valid = false;
    }

    if (!valid) {
      return;
    }

    const submitButton =
      form.querySelector('button[type="submit"]');

    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'createAppointment',

          doctor_id: doctorId,

          patient_name: patientName,

          patient_phone: patientPhone,

          patient_email: patientEmail,

          appointment_date: appointmentDate,

          appointment_time: appointmentTime,

          reason: reason
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || 'Unable to submit appointment request.'
        );
      }

      // -----------------------------
      // Update success screen
      // -----------------------------

      const doctorName =
        document.querySelector('[data-doctor-name]')?.dataset.doctorName || 'your doctor';

      document.getElementById('success-doctor-name').textContent = doctorName;
      document.getElementById('success-appointment-id').textContent =
        result.data.appointment_id;

      document.getElementById('success-date').textContent =
        formatDate(appointmentDate);

      document.getElementById('success-time').textContent =
        formatTime(appointmentTime);

      form.style.display = 'none';

     successState.hidden = false;
     successState.style.display = 'block';

     successState.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
});

    } catch (error) {

      console.error('Appointment submission error:', error);

      alert(
        error.message ||
        'Something went wrong. Please try again.'
      );

      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });


  // -----------------------------
  // Book another appointment
  // -----------------------------

  if (bookAnotherButton) {

    bookAnotherButton.addEventListener('click', function () {

      form.reset();

      clearErrors();

      form.style.display = '';
      successState.hidden = true;
      successState.style.display = 'none';

      const submitButton =
        form.querySelector('button[type="submit"]');

      submitButton.disabled = false;
      submitButton.textContent = 'Book Appointment';

      form.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

});


// ========================================
// Validation helpers
// ========================================

function showError(fieldId, message) {

  const field = document.getElementById(fieldId);

  const error =
    document.querySelector(
      '[data-error-for="' + fieldId + '"]'
    );

  if (field) {
    field.setAttribute('aria-invalid', 'true');
  }

  if (error) {
    error.textContent = message;
  }
}


function clearErrors() {

  const errors =
    document.querySelectorAll('.field-error');

  errors.forEach(function (error) {
    error.textContent = '';
  });

  const fields =
    document.querySelectorAll(
      '#appointment-form .form-control'
    );

  fields.forEach(function (field) {
    field.setAttribute('aria-invalid', 'false');
  });
}


// ========================================
// Date formatting
// ========================================

function formatDate(dateString) {

  const date = new Date(dateString + 'T00:00:00');

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}


// ========================================
// Time formatting
// ========================================

function formatTime(timeString) {

  const parts = timeString.split(':');

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  const suffix = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return hours + ':' + minutes + ' ' + suffix;
}