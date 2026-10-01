// ============================================================
// THOMSON CLINIC
// DOCTOR DASHBOARD
// ============================================================


// ============================================================
// API
// ============================================================

const API_URL =
  'https://script.google.com/macros/s/AKfycbwBlm1hceeXi7SWCu457cbauUsv5qx0tkdDB5mP_XO7GtloDiFg7fnuIW6VhylOacvvXg/exec';


// ============================================================
// SESSION
// ============================================================

const TOKEN_KEY =
  'thomson_google_token';


// ============================================================
// STATE
// ============================================================

let allAppointments = [];

let currentFilter = 'ALL';

let selectedAppointmentId = null;


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
  'DOMContentLoaded',
  function() {

    document
      .getElementById('refreshButton')
      .addEventListener(
        'click',
        loadAppointments
      );


    document
      .getElementById('logoutButton')
      .addEventListener(
        'click',
        logout
      );


    document
      .getElementById('searchInput')
      .addEventListener(
        'input',
        applyFilters
      );


    document
      .querySelectorAll('.quick-filter')
      .forEach(
        function(button) {

          button.addEventListener(
            'click',
            function() {

              currentFilter =
                button.dataset.filter ||
                'ALL';


              document
                .querySelectorAll('.quick-filter')
                .forEach(
                  function(item) {

                    item.classList.remove(
                      'active'
                    );

                  }
                );


              button.classList.add(
                'active'
              );


              applyFilters();

            }
          );

        }
      );


    loadAppointments();

  }
);


// ============================================================
// LOAD APPOINTMENTS
// ============================================================

async function loadAppointments() {

  const token =
    sessionStorage.getItem(
      TOKEN_KEY
    );


  if (!token) {

    window.location.href =
      'doctor-login.html';

    return;

  }


  showMessage('');


  renderLoading();


  try {

    const response =
      await fetch(
        API_URL,
        {

          method:
            'POST',

          headers:
            {
              'Content-Type':
                'text/plain;charset=utf-8'
            },

          body:
            JSON.stringify(
              {
                action:
                  'getMyAppointments',

                credential:
                  token
              }
            )

        }
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.message ||
        'Unable to load appointments.'
      );

    }


    // ----------------------------------------
    // Doctor information
    // ----------------------------------------

    renderDoctor(
      result.data.doctor
    );


    // ----------------------------------------
    // Store appointments
    // ----------------------------------------

    allAppointments =
      result.data.appointments ||
      [];


    // ----------------------------------------
    // Render
    // ----------------------------------------

    updateStats(
      allAppointments
    );


    applyFilters();


  } catch (error) {

    console.error(
      'Dashboard error:',
      error
    );


    showMessage(
      error.message ||
      'Unable to load appointments.'
    );


    renderEmpty(
      'Unable to load appointments',
      'Please refresh or sign in again.'
    );

  }

}


// ============================================================
// RENDER DOCTOR
// ============================================================

function renderDoctor(doctor) {

  const name =
    doctor.name ||
    doctor.doctor_name ||
    'Doctor';


  document
    .getElementById('doctorName')
    .textContent =
    name;


  document
    .getElementById('doctorSpeciality')
    .textContent =
    doctor.speciality ||
    '';


  document
    .getElementById('doctorMeta')
    .textContent =
    (
      (doctor.designation || '') +
      ' · ' +
      (doctor.doctor_id || '')
    )
      .replace(
        /^ · | · $/g,
        ''
      );


  document
    .getElementById('doctorAvatar')
    .textContent =
    getInitials(
      name
    );

}


// ============================================================
// UPDATE STATS
// ============================================================

function updateStats(
  appointments
) {

  let pending =
    0;

  let confirmed =
    0;

  let completed =
    0;


  appointments.forEach(
    function(item) {

      const status =
        String(
          item.status || ''
        )
          .trim()
          .toUpperCase();


      if (
        status === 'PENDING'
      ) {

        pending++;

      }


      if (
        status === 'CONFIRMED'
      ) {

        confirmed++;

      }


      if (
        status === 'COMPLETED'
      ) {

        completed++;

      }

    }
  );


  document
    .getElementById('totalCount')
    .textContent =
    appointments.length;


  document
    .getElementById('pendingCount')
    .textContent =
    pending;


  document
    .getElementById('confirmedCount')
    .textContent =
    confirmed;


  document
    .getElementById('completedCount')
    .textContent =
    completed;

}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyFilters() {

  const searchInput =
    document.getElementById(
      'searchInput'
    );


  const search =
    String(
      searchInput.value || ''
    )
      .trim()
      .toLowerCase();


  let filtered =
    allAppointments.filter(
      function(item) {

        const status =
          String(
            item.status || ''
          )
            .trim()
            .toUpperCase();


        // ------------------------------------
        // Status filter
        // ------------------------------------

        if (
          currentFilter !== 'ALL' &&
          currentFilter !== 'TODAY' &&
          status !== currentFilter
        ) {

          return false;

        }


        // ------------------------------------
        // Today filter
        // ------------------------------------

        if (
          currentFilter === 'TODAY' &&
          !isToday(
            item.appointment_date
          )
        ) {

          return false;

        }


        // ------------------------------------
        // Search
        // ------------------------------------

        if (!search) {

          return true;

        }


        const searchable = (

          String(
            item.patient_name || ''
          ) +

          ' ' +

          String(
            item.patient_phone || ''
          ) +

          ' ' +

          String(
            item.reason || ''
          ) +

          ' ' +

          String(
            item.appointment_id || ''
          )

        ).toLowerCase();


        return searchable.includes(
          search
        );

      }
    );


  renderAppointmentList(
    filtered
  );


  document
    .getElementById('visibleCount')
    .textContent =
    filtered.length;


  // ----------------------------------------
  // Preserve selected appointment
  // ----------------------------------------

  if (
    selectedAppointmentId
  ) {

    const selected =
      filtered.find(
        function(item) {

          return (
            String(
              item.appointment_id
            ) ===
            String(
              selectedAppointmentId
            )
          );

        }
      );


    if (selected) {

      renderConversation(
        selected
      );

      return;

    }

  }


  // ----------------------------------------
  // Automatically select first appointment
  // ----------------------------------------

  if (
    filtered.length
  ) {

    selectedAppointmentId =
      filtered[0].appointment_id;


    renderConversation(
      filtered[0]
    );

  } else {

    selectedAppointmentId =
      null;


    renderWelcome();

  }

}


// ============================================================
// RENDER APPOINTMENT LIST
// ============================================================

function renderAppointmentList(
  appointments
) {

  const list =
    document.getElementById(
      'appointmentList'
    );


  if (
    !appointments.length
  ) {

    list.innerHTML = `

      <div class="empty-state">

        <div>
          No appointments found
        </div>

        <div>
          Try another filter or search.
        </div>

      </div>

    `;

    return;

  }


  list.innerHTML =
    appointments
      .map(
        function(item) {

          return renderAppointmentItem(
            item
          );

        }
      )
      .join('');


  // ----------------------------------------
  // Add click handlers
  // ----------------------------------------

  list
    .querySelectorAll(
      '.appointment-item'
    )
    .forEach(
      function(element) {

        element.addEventListener(
          'click',
          function() {

            const id =
              element.dataset.appointmentId;


            const appointment =
              allAppointments.find(
                function(item) {

                  return (
                    String(
                      item.appointment_id
                    ) ===
                    String(id)
                  );

                }
              );


            if (!appointment) {

              return;

            }


            selectedAppointmentId =
              appointment.appointment_id;


            list
              .querySelectorAll(
                '.appointment-item'
              )
              .forEach(
                function(item) {

                  item.classList.remove(
                    'selected'
                  );

                }
              );


            element.classList.add(
              'selected'
            );


            renderConversation(
              appointment
            );

          }
        );

      }
    );


  // ----------------------------------------
  // Highlight current selection
  // ----------------------------------------

  if (
    selectedAppointmentId
  ) {

    const selected =
      list.querySelector(
        `[data-appointment-id="${escapeSelector(selectedAppointmentId)}"]`
      );


    if (selected) {

      selected.classList.add(
        'selected'
      );

    }

  }

}


// ============================================================
// APPOINTMENT LIST ITEM
// ============================================================

function renderAppointmentItem(
  item
) {

  const status =
    String(
      item.status || 'PENDING'
    )
      .trim()
      .toLowerCase();


  const name =
    item.patient_name ||
    'Patient';


  return `

    <button
      class="appointment-item"
      type="button"
      data-appointment-id="${escapeHtml(item.appointment_id)}"
    >

      <div class="patient-avatar">
        ${escapeHtml(
          getInitials(name)
        )}
      </div>


      <div class="appointment-summary">

        <div class="appointment-row">

          <div class="patient-list-name">
            ${escapeHtml(name)}
          </div>

          <div class="appointment-time">
            ${escapeHtml(
              formatShortTime(
                item.appointment_time
              )
            )}
          </div>

        </div>


        <div class="appointment-reason">

          ${escapeHtml(
            item.reason ||
            'Appointment request'
          )}

        </div>


        <div class="appointment-status-line">

          <span
            class="status-dot ${status}"
          ></span>

          <span class="status-text">

            ${escapeHtml(
              capitalizeStatus(
                status
              )
            )}

          </span>

        </div>

      </div>

    </button>

  `;

}


// ============================================================
// RENDER CONVERSATION
// ============================================================

function renderConversation(
  item
) {

  const name =
    item.patient_name ||
    'Patient';


  const phone =
    item.patient_phone ||
    '';


  const phoneNumber =
    normalizePhone(
      phone
    );


  // ----------------------------------------
  // Header
  // ----------------------------------------

  document
    .getElementById(
      'conversationAvatar'
    )
    .textContent =
    getInitials(name);


  document
    .getElementById(
      'conversationName'
    )
    .textContent =
    name;


  document
    .getElementById(
      'conversationPhone'
    )
    .textContent =
    phone ||
    'No phone number';


  // ----------------------------------------
  // Header call
  // ----------------------------------------

  const headerCall =
    document.getElementById(
      'headerCallButton'
    );


  const headerWhatsApp =
    document.getElementById(
      'headerWhatsAppButton'
    );


  if (phoneNumber) {

    headerCall.href =
      `tel:+${phoneNumber}`;

    headerCall.hidden =
      false;


    headerWhatsApp.href =
      `https://wa.me/${phoneNumber}`;

    headerWhatsApp.hidden =
      false;

  } else {

    headerCall.hidden =
      true;

    headerWhatsApp.hidden =
      true;

  }


  // ----------------------------------------
  // Conversation body
  // ----------------------------------------

  const body =
    document.getElementById(
      'conversationBody'
    );


  body.innerHTML =
    renderAppointmentBubble(
      item
    );


  // ----------------------------------------
  // Footer
  // ----------------------------------------

  renderFooterActions(
    item,
    phoneNumber
  );

}


// ============================================================
// APPOINTMENT BUBBLE
// ============================================================

function renderAppointmentBubble(
  item
) {

  const status =
    String(
      item.status || 'PENDING'
    )
      .trim()
      .toLowerCase();


  const phone =
    normalizePhone(
      item.patient_phone
    );


  const callUrl =
    phone
      ? `tel:+${phone}`
      : '#';


  const whatsappUrl =
    phone
      ? `https://wa.me/${phone}`
      : '#';


  // ----------------------------------------
  // Digital prescription URL
  //
  // Appointment and patient information are
  // passed as query parameters so rx.html
  // can use them later.
  // ----------------------------------------

  const prescriptionUrl =
    buildPrescriptionUrl(
      item
    );


  return `

    <div class="message-bubble">

      <div class="bubble-label">
        Appointment Request
      </div>


      <div class="bubble-status ${status}">
        ${escapeHtml(
          capitalizeStatus(status)
        )}
      </div>


      <div class="bubble-reason">

        ${escapeHtml(
          item.reason ||
          'No reason provided'
        )}

      </div>


      <div class="appointment-detail-box">


        <div class="detail-row">

          <div class="detail-label">
            Date
          </div>

          <div class="detail-value">
            ${escapeHtml(
              formatLongDate(
                item.appointment_date
              )
            )}
          </div>

        </div>


        <div class="detail-row">

          <div class="detail-label">
            Time
          </div>

          <div class="detail-value">
            ${escapeHtml(
              formatDisplayTime(
                item.appointment_time
              )
            )}
          </div>

        </div>


        <div class="detail-row">

          <div class="detail-label">
            Mobile
          </div>

          <div class="detail-value">
            ${escapeHtml(
              item.patient_phone ||
              'Not provided'
            )}
          </div>

        </div>


        <div class="detail-row">

          <div class="detail-label">
            Patient
          </div>

          <div class="detail-value">
            ${escapeHtml(
              item.patient_name ||
              ''
            )}
          </div>

        </div>


      </div>


      <div class="bubble-actions">

        ${
          phone
            ? `
              <a
                class="bubble-button bubble-call"
                href="${callUrl}"
              >
                Call
              </a>
            `
            : ''
        }


        ${
          phone
            ? `
              <a
                class="bubble-button bubble-whatsapp"
                href="${whatsappUrl}"
                target="_blank"
                rel="noopener"
              >
                WhatsApp
              </a>
            `
            : ''
        }


        <a
          class="bubble-button bubble-prescription"
          href="${prescriptionUrl}"
          target="_blank"
          rel="noopener"
        >
          Digital Prescription
        </a>

      </div>


      <div class="bubble-reference">

        Appointment:
        ${escapeHtml(
          item.appointment_id || ''
        )}

      </div>

    </div>

  `;

}


// ============================================================
// FOOTER ACTIONS
// ============================================================

function renderFooterActions(
  item,
  phoneNumber
) {

  const footer =
    document.getElementById(
      'conversationFooter'
    );


  footer.hidden =
    false;


  const prescription =
    document.getElementById(
      'footerPrescriptionButton'
    );


  const call =
    document.getElementById(
      'footerCallButton'
    );


  const whatsapp =
    document.getElementById(
      'footerWhatsAppButton'
    );


  // ----------------------------------------
  // Prescription
  // ----------------------------------------

  prescription.href =
    buildPrescriptionUrl(
      item
    );


  // ----------------------------------------
  // Call
  // ----------------------------------------

  if (phoneNumber) {

    call.href =
      `tel:+${phoneNumber}`;

    call.style.display =
      'inline-flex';


    whatsapp.href =
      `https://wa.me/${phoneNumber}`;

    whatsapp.style.display =
      'inline-flex';

  } else {

    call.style.display =
      'none';

    whatsapp.style.display =
      'none';

  }

}


// ============================================================
// DIGITAL PRESCRIPTION URL
// ============================================================

function buildPrescriptionUrl(
  item
) {

  const base =
    'https://doctorjet.in/rx.html';


  const params =
    new URLSearchParams();


  if (
    item.appointment_id
  ) {

    params.set(
      'appointment_id',
      item.appointment_id
    );

  }


  if (
    item.patient_id
  ) {

    params.set(
      'patient_id',
      item.patient_id
    );

  }


  if (
    item.patient_name
  ) {

    params.set(
      'patient_name',
      item.patient_name
    );

  }


  if (
    item.patient_phone
  ) {

    params.set(
      'patient_phone',
      item.patient_phone
    );

  }


  return (
    base +
    '?' +
    params.toString()
  );

}


// ============================================================
// WELCOME SCREEN
// ============================================================

function renderWelcome() {

  document
    .getElementById(
      'conversationName'
    )
    .textContent =
    'Select an appointment';


  document
    .getElementById(
      'conversationPhone'
    )
    .textContent =
    'Choose a patient from the inbox';


  document
    .getElementById(
      'conversationAvatar'
    )
    .textContent =
    'TC';


  document
    .getElementById(
      'conversationBody'
    )
    .innerHTML = `

      <div class="welcome-panel">

        <div class="welcome-icon">
          TC
        </div>

        <h2>
          Thomson Clinic
        </h2>

        <p>
          Select an appointment from the inbox
          to view patient details.
        </p>

      </div>

    `;


  document
    .getElementById(
      'conversationFooter'
    )
    .hidden =
    true;


  document
    .getElementById(
      'headerCallButton'
    )
    .hidden =
    true;


  document
    .getElementById(
      'headerWhatsAppButton'
    )
    .hidden =
    true;

}


// ============================================================
// LOADING
// ============================================================

function renderLoading() {

  document
    .getElementById(
      'appointmentList'
    )
    .innerHTML = `

      <div class="loading-state">

        <div class="loading-spinner"></div>

        <div>
          Loading appointments…
        </div>

      </div>

    `;

}


// ============================================================
// EMPTY
// ============================================================

function renderEmpty(
  title,
  text
) {

  document
    .getElementById(
      'appointmentList'
    )
    .innerHTML = `

      <div class="empty-state">

        <div>
          ${escapeHtml(title)}
        </div>

        <div>
          ${escapeHtml(text)}
        </div>

      </div>

    `;

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
  message
) {

  const element =
    document.getElementById(
      'message'
    );


  if (!message) {

    element.textContent =
      '';

    element.classList.add(
      'hidden'
    );

    return;

  }


  element.textContent =
    message;


  element.classList.remove(
    'hidden'
  );

}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

  sessionStorage.removeItem(
    TOKEN_KEY
  );


  sessionStorage.removeItem(
    'thomson_doctor'
  );


  window.location.href =
    'doctor-login.html';

}


// ============================================================
// PHONE NORMALIZATION
// ============================================================

function normalizePhone(
  value
) {

  const raw =
    String(
      value || ''
    ).trim();


  if (!raw) {

    return '';

  }


  const digits =
    raw.replace(
      /\D/g,
      ''
    );


  if (
    digits.length === 10
  ) {

    return (
      '91' +
      digits
    );

  }


  if (
    digits.length === 12 &&
    digits.startsWith('91')
  ) {

    return digits;

  }


  return digits;

}


// ============================================================
// DATE
// ============================================================

function formatLongDate(
  value
) {

  if (!value) {

    return '';

  }


  const parts =
    String(value)
      .split('-');


  if (
    parts.length !== 3
  ) {

    return value;

  }


  const date =
    new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return value;

  }


  return date.toLocaleDateString(
    'en-IN',
    {
      day:
        '2-digit',

      month:
        'long',

      year:
        'numeric'
    }
  );

}


// ============================================================
// TIME
// ============================================================

function formatDisplayTime(
  value
) {

  if (!value) {

    return '';

  }


  const raw =
    String(value)
      .trim();


  const parts =
    raw.split(':');


  if (
    parts.length < 2
  ) {

    return raw;

  }


  let hours =
    Number(parts[0]);


  const minutes =
    String(parts[1])
      .padStart(
        2,
        '0'
      );


  if (
    isNaN(hours)
  ) {

    return raw;

  }


  const suffix =
    hours >= 12
      ? 'PM'
      : 'AM';


  hours =
    hours % 12 ||
    12;


  return (
    hours +
    ':' +
    minutes +
    ' ' +
    suffix
  );

}


// ============================================================
// SHORT TIME
// ============================================================

function formatShortTime(
  value
) {

  return formatDisplayTime(
    value
  );

}


// ============================================================
// TODAY
// ============================================================

function isToday(
  value
) {

  if (!value) {

    return false;

  }


  const parts =
    String(value)
      .split('-');


  if (
    parts.length !== 3
  ) {

    return false;

  }


  const date =
    new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );


  const today =
    new Date();


  return (
    date.getFullYear() ===
      today.getFullYear() &&

    date.getMonth() ===
      today.getMonth() &&

    date.getDate() ===
      today.getDate()
  );

}


// ============================================================
// INITIALS
// ============================================================

function getInitials(
  name
) {

  const words =
    String(
      name || ''
    )
      .trim()
      .split(
        /\s+/
      )
      .filter(
        Boolean
      );


  if (!words.length) {

    return 'PT';

  }


  if (
    words.length === 1
  ) {

    return words[0]
      .substring(
        0,
        2
      )
      .toUpperCase();

  }


  return (

    words[0][0] +
    words[words.length - 1][0]

  ).toUpperCase();

}


// ============================================================
// STATUS
// ============================================================

function capitalizeStatus(
  value
) {

  const text =
    String(
      value || ''
    )
      .toLowerCase();


  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );

}


// ============================================================
// HTML ESCAPING
// ============================================================

function escapeHtml(
  value
) {

  return String(
    value ?? ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );

}


// ============================================================
// CSS SELECTOR ESCAPING
// ============================================================

function escapeSelector(
  value
) {

  return String(
    value || ''
  ).replace(
    /["\\]/g,
    '\\$&'
  );

}