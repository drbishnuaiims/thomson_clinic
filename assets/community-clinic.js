(() => {
  if (document.getElementById("communityClinicModal")) return;

  const script = document.currentScript;
  const whatsappNumber = script?.dataset.whatsappNumber || "919438450966";

  const modal = document.createElement("div");
  modal.className = "community-clinic-modal";
  modal.id = "communityClinicModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "communityClinicTitle");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="community-clinic-dialog">
      <button class="community-clinic-close" type="button" aria-label="Close modal">×</button>
      <p class="community-clinic-kicker">Thomson Clinic Network</p>
      <h2 class="community-clinic-title" id="communityClinicTitle">Start Your Community / Rural Clinic</h2>
      <p class="community-clinic-intro">
        Partner with Thomson Clinic to bring specialist consultations, mental health, and neurology care to your village, town, or local community. Fill in your details below to connect directly with Thomson Clinic on WhatsApp.
      </p>
      <form class="community-clinic-form" id="communityClinicForm">
        <div class="community-clinic-form-grid">
          <label class="community-clinic-field">
            Full name *
            <input name="name" type="text" autocomplete="name" placeholder="Your full name" required>
          </label>
          <label class="community-clinic-field">
            Phone / WhatsApp *
            <input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="10-digit mobile number" required>
          </label>
          <label class="community-clinic-field">
            Email address *
            <input name="email" type="email" autocomplete="email" placeholder="name@example.com" required>
          </label>
          <label class="community-clinic-field">
            Your profession / role *
            <select name="profession" required>
              <option value="">Select your background</option>
              <option value="Doctor (MBBS / Specialist / AYUSH)">Doctor (MBBS / Specialist / AYUSH)</option>
              <option value="Pharmacist / Pharmacy Owner">Pharmacist / Pharmacy Owner</option>
              <option value="Nurse / Healthcare Professional">Nurse / Healthcare Professional</option>
              <option value="Clinic / Hospital Owner">Clinic / Hospital Owner</option>
              <option value="Social Worker / Community Leader / NGO">Social Worker / Community Leader / NGO</option>
              <option value="Entrepreneur / Local Business Owner">Entrepreneur / Local Business Owner</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label class="community-clinic-field community-clinic-conditional full-width" data-other-profession hidden>
            Specify your profession / background *
            <input name="otherProfession" type="text" placeholder="e.g. Health center coordinator">
          </label>
          <label class="community-clinic-field full-width">
            Proposed clinic location *
            <input name="location" type="text" placeholder="Village / Town, Block, District, State (e.g. Nimapada, Puri, Odisha)" required>
          </label>
          <label class="community-clinic-field full-width">
            Premises / facility available *
            <select name="facilityType" required>
              <option value="">Select facility type</option>
              <option value="Existing clinic / consultation chamber">Existing clinic / consultation chamber</option>
              <option value="Existing pharmacy / medical store">Existing pharmacy / medical store</option>
              <option value="Dedicated commercial room / shop">Dedicated commercial room / shop</option>
              <option value="Community center / Panchayat building">Community center / Panchayat building</option>
              <option value="Home-based setup">Home-based setup</option>
              <option value="Planning to rent or construct a new space">Planning to rent or construct a new space</option>
              <option value="Other">Other setup</option>
            </select>
          </label>
        </div>

        <fieldset class="community-clinic-checkbox-group">
          <legend>Infrastructure currently available</legend>
          <div class="community-clinic-checkbox-grid">
            <label class="community-clinic-checkbox-label">
              <input type="checkbox" name="infra" value="Internet / Wi-Fi / 4G">
              <span>Internet / 4G connection</span>
            </label>
            <label class="community-clinic-checkbox-label">
              <input type="checkbox" name="infra" value="Computer / Laptop / Tablet / Smartphone">
              <span>Computer, Tablet or Smartphone</span>
            </label>
            <label class="community-clinic-checkbox-label">
              <input type="checkbox" name="infra" value="Patient waiting area / examination table">
              <span>Waiting space / exam table</span>
            </label>
            <label class="community-clinic-checkbox-label">
              <input type="checkbox" name="infra" value="Power backup / inverter">
              <span>Power backup / inverter</span>
            </label>
          </div>
        </fieldset>

        <label class="community-clinic-field">
          Primary healthcare specialties needed in your community *
          <select name="specialtiesNeeded" required>
            <option value="">Select primary need</option>
            <option value="Mental Health & Psychiatry">Mental Health & Psychiatry</option>
            <option value="General Medicine & Chronic Care (Diabetes, BP)">General Medicine & Chronic Care (Diabetes, BP)</option>
            <option value="Neurology & Neuroscience">Neurology & Neuroscience</option>
            <option value="Pediatrics & Child Health">Pediatrics & Child Health</option>
            <option value="Comprehensive Multi-Specialty Care">Comprehensive Multi-Specialty Care</option>
            <option value="Other / All Specialties">Other / All Specialties</option>
          </select>
        </label>

        <label class="community-clinic-field">
          Additional details or message (optional)
          <textarea name="notes" rows="3" placeholder="Tell us about patient footfall, population, local requirements, or your timeline..."></textarea>
        </label>

        <button class="community-clinic-submit" type="submit">Continue to WhatsApp</button>
        <p class="community-clinic-privacy">
          Your information is not stored on any server. WhatsApp will open with your pre-filled inquiry to Thomson Clinic.
        </p>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector("form");
  const closeButton = modal.querySelector(".community-clinic-close");
  const professionSelect = form.elements.namedItem("profession");
  const otherProfessionField = modal.querySelector("[data-other-profession]");
  const otherProfessionInput = otherProfessionField.querySelector("input");
  let previousFocus;

  const open = () => {
    previousFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("community-clinic-open");
    closeButton.focus();
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("community-clinic-open");
    previousFocus?.focus();
  };

  window.openCommunityClinicModal = open;

  professionSelect.addEventListener("change", () => {
    const isOther = professionSelect.value === "Other";
    otherProfessionField.hidden = !isOther;
    otherProfessionInput.required = isOther;
    if (!isOther) otherProfessionInput.value = "";
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".community-clinic-trigger, .tc-site-community-trigger");
    if (trigger) {
      event.preventDefault();
      // Close mobile menu if open
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

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const profession = data.get("profession") === "Other"
      ? (data.get("otherProfession")?.toString().trim() || "Other")
      : data.get("profession");

    const infraItems = form.querySelectorAll('input[name="infra"]:checked');
    const infraList = Array.from(infraItems).map(el => el.value).join(", ") || "None specified";

    const notes = data.get("notes")?.toString().trim();

    const message = [
      "*THOMSON CLINIC — START COMMUNITY / RURAL CLINIC*",
      "",
      `*Applicant Name:* ${data.get("name")?.toString().trim()}`,
      `*Phone / WhatsApp:* ${data.get("phone")?.toString().trim()}`,
      `*Email:* ${data.get("email")?.toString().trim()}`,
      `*Profession / Background:* ${profession}`,
      `*Proposed Location:* ${data.get("location")?.toString().trim()}`,
      `*Premises / Facility:* ${data.get("facilityType")}`,
      `*Available Infrastructure:* ${infraList}`,
      `*Specialties Needed:* ${data.get("specialtiesNeeded")}`,
      notes ? `*Additional Notes:* ${notes}` : "",
      "",
      "Looking forward to discussing the clinic setup, telemedicine support, and partnership details."
    ].filter(Boolean).join("\n");

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    close();
  });
})();
