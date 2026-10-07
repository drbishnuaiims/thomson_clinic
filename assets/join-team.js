(() => {
  const script = document.currentScript;
  const whatsappNumber = script?.dataset.whatsappNumber;
  if (!whatsappNumber || !/^\d+$/.test(whatsappNumber)) {
    throw new Error("A valid Thomson Clinic WhatsApp number is required.");
  }

  const modal = document.createElement("div");
  modal.className = "join-team-modal";
  modal.id = "joinOurTeamModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "joinTeamTitle");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <section class="join-team-dialog">
      <button class="join-team-close" type="button" aria-label="Close joining form">×</button>
      <p class="join-team-kicker">Thomson Clinic</p>
      <h2 id="joinTeamTitle">Join our team</h2>
      <p class="join-team-intro">Tell us about your clinical practice and the specialty you would like to join. Your details will be prepared as a WhatsApp message to Thomson Clinic.</p>
      <form class="join-team-form">
        <div class="join-team-form-grid">
          <label class="join-team-field">Full name *
            <input name="name" type="text" autocomplete="name" required>
          </label>
          <label class="join-team-field">Specialty *
            <select name="specialty" required>
              <option value="">Select your specialty</option>
              <option>Psychiatry</option>
              <option>Clinical Psychology</option>
              <option>Psychology / Therapy</option>
              <option>Psychiatric Social Work</option>
              <option>Neurology</option>
              <option>Neurosurgery</option>
              <option>Cardiology</option>
              <option>Nephrology</option>
              <option>Respiratory Medicine / Pulmonology</option>
              <option>Oncology</option>
              <option>Pediatrics</option>
              <option>Internal Medicine</option>
              <option>Dermatology</option>
              <option>Endocrinology / Diabetes</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label class="join-team-field join-team-conditional" data-other-specialty hidden>Other specialty *
            <input name="otherSpecialty" type="text" autocomplete="off">
          </label>
          <label class="join-team-field">Qualifications *
            <input name="qualifications" type="text" placeholder="e.g. MBBS, MD" required>
          </label>
          <label class="join-team-field">Years of experience *
            <input name="experience" type="number" min="0" max="80" step="1" inputmode="numeric" required>
          </label>
          <label class="join-team-field">City / location *
            <input name="location" type="text" autocomplete="address-level2" required>
          </label>
          <label class="join-team-field">Current clinic / hospital
            <input name="practice" type="text" autocomplete="organization">
          </label>
          <label class="join-team-field">Phone / WhatsApp *
            <input name="phone" type="tel" autocomplete="tel" inputmode="tel" required>
          </label>
          <label class="join-team-field">Email *
            <input name="email" type="email" autocomplete="email" required>
          </label>
        </div>
        <fieldset class="join-team-doctorjet">
          <legend>Do you have a DoctorJet profile? *</legend>
          <div class="join-team-radio-options">
            <label><input type="radio" name="doctorjet" value="yes" required> Yes</label>
            <label><input type="radio" name="doctorjet" value="no" required> No</label>
          </div>
          <div class="join-team-conditional" data-doctorjet-link hidden>
            <label class="join-team-field">DoctorJet profile link (if available)
              <input name="doctorjetLink" type="url" inputmode="url" pattern="https?://.+" title="Enter a link beginning with http:// or https://" placeholder="https://doctorjet.in/...">
            </label>
            <p class="join-team-guidance">If you have a profile, please share its QR code or link in the WhatsApp chat. If you do not have the link handy, you can send the QR code there.</p>
          </div>
          <p class="join-team-guidance" data-doctorjet-create hidden>Please create a DoctorJet profile, then share its link or QR code in the WhatsApp chat.</p>
        </fieldset>
        <button class="join-team-submit" type="submit">Continue to WhatsApp</button>
        <p class="join-team-privacy">Your information is not stored or submitted to a server. WhatsApp opens with a prepared message; review and send it there.</p>
      </form>
    </section>
  `;
  document.body.append(modal);

  const form = modal.querySelector("form");
  const closeButton = modal.querySelector(".join-team-close");
  const specialty = form.elements.namedItem("specialty");
  const otherSpecialty = modal.querySelector("[data-other-specialty]");
  const doctorjetLink = modal.querySelector("[data-doctorjet-link]");
  const doctorjetCreate = modal.querySelector("[data-doctorjet-create]");
  let previousFocus;

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("join-team-open");
    previousFocus?.focus();
  };

  const open = () => {
    previousFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("join-team-open");
    closeButton.focus();
  };

  const updateSpecialty = () => {
    const isOther = specialty.value === "Other";
    otherSpecialty.hidden = !isOther;
    otherSpecialty.querySelector("input").required = isOther;
  };

  const updateDoctorjet = () => {
    const answer = form.elements.namedItem("doctorjet").value;
    doctorjetLink.hidden = answer !== "yes";
    doctorjetCreate.hidden = answer !== "no";
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".join-team-trigger, .tc-site-join-trigger");
    if (trigger) {
      event.preventDefault();
      const nav = trigger.closest("nav");
      const menuButton = nav?.parentElement?.querySelector(
        ".tc-site-menu-toggle, .menu-toggle, #mobileMenu"
      );
      if (nav?.classList.contains("open") || nav?.classList.contains("is-open")) {
        nav.classList.remove("open", "is-open");
        if (menuButton) {
          menuButton.setAttribute("aria-expanded", "false");
          menuButton.setAttribute("aria-label", "Open navigation");
          menuButton.textContent = "☰";
          menuButton.focus();
        }
      }
      open();
    }
  });

  closeButton.addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) close();
  });
  specialty.addEventListener("change", updateSpecialty);
  form.querySelectorAll('input[name="doctorjet"]').forEach((input) => {
    input.addEventListener("change", updateDoctorjet);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const doctorjetAnswer = data.get("doctorjet");
    const message = [
      "*THOMSON CLINIC — DOCTOR JOINING REQUEST*",
      "",
      `*Name:* ${data.get("name").trim()}`,
      `*Specialty:* ${data.get("specialty") === "Other" ? data.get("otherSpecialty").trim() : data.get("specialty")}`,
      `*Qualifications:* ${data.get("qualifications").trim()}`,
      `*Years of experience:* ${data.get("experience")}`,
      `*City / location:* ${data.get("location").trim()}`,
      data.get("practice").trim() ? `*Current clinic / hospital:* ${data.get("practice").trim()}` : "",
      `*Phone / WhatsApp:* ${data.get("phone").trim()}`,
      `*Email:* ${data.get("email").trim()}`,
      "",
      `*Do you have a DoctorJet profile?* ${doctorjetAnswer === "yes" ? "Yes" : "No"}`,
      doctorjetAnswer === "yes"
        ? (data.get("doctorjetLink").trim()
          ? `*DoctorJet profile link:* ${data.get("doctorjetLink").trim()}\nPlease share your DoctorJet QR code in this WhatsApp chat if available.`
          : "Please share your DoctorJet QR code or profile link in this WhatsApp chat.")
        : "Please create a DoctorJet profile, then share its link or QR code in this WhatsApp chat.",
    ].filter(Boolean).join("\n");

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    close();
  });
})();
