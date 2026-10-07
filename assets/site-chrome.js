(() => {
  const currentScript = document.currentScript;
  if (!currentScript?.dataset.siteRoot) {
    throw new Error("The shared site script requires a site-root path.");
  }

  const siteRoot = new URL(currentScript.dataset.siteRoot, document.baseURI);
  const homeUrl = new URL("index.html", siteRoot);
  const sectionUrl = (section) => `${homeUrl.href}#${section}`;
  const assetUrl = (path) => new URL(path, siteRoot).href;
  const isProfile = Boolean(document.querySelector(".platform-bar"));
  const doctors = [
    ["Dr. Antaryami Sahoo · Radiation Oncology", "dr-antaryami-sahoo-senior-consultant–radiation-oncology-capital-hospital-bhubaneswar"],
    ["Dr. Anushree Mishra · Clinical Psychology", "dr-anushree-mishra-clinical-psychologist-aiims-bhubaneswar"],
    ["Dr. Asit Kumar Mohanty · Radiation Oncology", "dr-asit-kumar-mohanty-senior-consultant-hod-radiation-oncology-kims-bhubaneswar"],
    ["Dr. Aswini Kumar Panigrahi · Nephrology", "dr-aswini-kumar-panigrahi-senior-consultant-nephrologist-apollo-hospital-hyderabad"],
    ["Dr. Bishnu Prasad Sahoo · Neuropsychiatry", "dr-bishnu-prasad-sahoo-neuropsychiatrist-aiims-bhubaneswar"],
    ["Dr. Byomakesh Dikshit · Cardiology", "dr-byomakesh-dikshit-senior-consultant-cardiologist-bhubaneswar"],
    ["Dr. Debasish Prusty · Pediatrics", "dr-debasish-prusty-consultant-pediatrician-bhubaneswar"],
    ["Dr. Thitta Mohanty · Respiratory Medicine", "dr-thitta-mohanty-professor-respiratory-medicine-pgimer-capital-hospital-bhubaneswar"],
  ];
  const header = document.createElement("header");

  header.className = "tc-site-header";
  header.innerHTML = `
    <div class="tc-site-header-inner">
      <a class="tc-site-brand" href="${homeUrl.href}" aria-label="Thomson Clinic home">
        <img src="${assetUrl("assets/thomson-clinic-logo-header.png")}" alt="">
        <span class="tc-site-brand-copy">
          <span class="tc-site-brand-name">Thomson Clinic</span>
          <span class="tc-site-brand-caption">Mental Health &amp; Neuroscience e-Clinic</span>
        </span>
      </a>
      <div class="tc-site-search">
        <input class="tc-site-search-input" type="search" aria-label="Search doctors" placeholder="Search doctors, specialties, locations" autocomplete="off" aria-controls="tcDoctorSearchResults" aria-expanded="false">
        <div class="tc-site-search-results" id="tcDoctorSearchResults" role="listbox" hidden></div>
      </div>
      <nav class="tc-site-nav" aria-label="Main navigation">
        <a href="${sectionUrl("mental-health")}">Mental Health</a>
        <a href="${sectionUrl("care")}">Care</a>
        <a href="${sectionUrl("specialties")}">Specialties</a>
        <a href="${sectionUrl("professionals")}">Professionals</a>
        <a href="${sectionUrl("faq")}">FAQ</a>
        <button class="tc-site-join-trigger" type="button">Join our team</button>
        <button class="tc-site-nav-cta" type="button">Book consultation</button>
      </nav>
      <button class="tc-site-menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false">☰</button>
    </div>
  `;

  const footer = document.createElement("footer");
  footer.className = "tc-site-footer";
  footer.innerHTML = `
    <div class="tc-site-footer-inner">
      <div class="tc-site-footer-grid">
        <div>
          <a class="tc-site-brand" href="${homeUrl.href}" aria-label="Thomson Clinic home">
            <img src="${assetUrl("assets/thomson-clinic-logo-header.png")}" alt="">
            <span class="tc-site-brand-copy">
              <span class="tc-site-brand-name">Thomson Clinic</span>
              <span class="tc-site-brand-caption">Mental Health &amp; Neuroscience e-Clinic</span>
            </span>
          </a>
          <p class="tc-site-footer-description">A specialized mental health and neuroscience e-Clinic, with a connected network of specialist medical clinics.</p>
        </div>
        <div>
          <h2 class="tc-site-footer-heading">Mental Health</h2>
          <div class="tc-site-footer-links">
            <a href="${sectionUrl("mental-health")}">Psychiatry</a>
            <a href="${sectionUrl("mental-health")}">Psychology &amp; Therapy</a>
            <a href="${sectionUrl("mental-health")}">Neuroscience</a>
            <a href="${sectionUrl("mental-health")}">Sleep</a>
            <a href="${sectionUrl("mental-health")}">Addiction</a>
          </div>
        </div>
        <div>
          <h2 class="tc-site-footer-heading">Network</h2>
          <div class="tc-site-footer-links">
            <a href="${sectionUrl("professionals")}">Doctors</a>
            <a href="${sectionUrl("professionals")}">Therapists</a>
            <a href="${sectionUrl("care")}">Clinics</a>
            <a href="${sectionUrl("specialties")}">Specialties</a>
          </div>
        </div>
        <div>
          <h2 class="tc-site-footer-heading">Thomson Clinic</h2>
          <div class="tc-site-footer-links">
            <a href="${sectionUrl("how")}">How it works</a>
            <a href="${sectionUrl("faq")}">FAQ</a>
            <a href="${sectionUrl("professionals")}" data-site-book>Book consultation</a>
            <a href="mailto:hello@thomsonclinic.com">Contact</a>
          </div>
        </div>
      </div>
      <div class="tc-site-footer-bottom">
        <span>© <span data-current-year></span> Thomson Clinic powered by <a href="https://doctorjet.in" target="_blank" rel="noopener noreferrer">DoctorJet.in</a></span>
        <span>Mental Health · Neuroscience · Integrated Specialist Care</span>
      </div>
    </div>
  `;

  document.body.classList.add("tc-site-page");
  document.body.insertAdjacentElement("afterbegin", header);
  document.body.insertAdjacentElement("beforeend", footer);

  footer.querySelector("[data-current-year]").textContent =
    String(new Date().getFullYear());

  const menuButton = header.querySelector(".tc-site-menu-toggle");
  const nav = header.querySelector(".tc-site-nav");
  const searchInput = header.querySelector(".tc-site-search-input");
  const searchResults = header.querySelector(".tc-site-search-results");

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a, .tc-site-nav-cta")) {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    }
  });

  const bookConsultation = (event) => {
    event.preventDefault();
    if (typeof window.openBooking === "function") {
      window.openBooking();
    } else if (isProfile) {
      window.location.hash = "bookingModal";
    } else {
      window.location.href = sectionUrl("professionals");
    }
  };

  header.querySelector(".tc-site-nav-cta").addEventListener("click", bookConsultation);
  footer.querySelector("[data-site-book]").addEventListener("click", bookConsultation);

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    searchResults.replaceChildren();

    if (!query) {
      searchResults.hidden = true;
      searchInput.setAttribute("aria-expanded", "false");
      return;
    }

    const matches = doctors.filter(([label]) => label.toLocaleLowerCase().includes(query));
    for (const [label, slug] of matches.slice(0, 6)) {
      const result = document.createElement("a");
      result.className = "tc-site-search-result";
      result.setAttribute("role", "option");
      result.href = new URL(`doctors/${slug}/index.html`, siteRoot).href;
      result.textContent = label;
      searchResults.append(result);
    }

    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "tc-site-search-result";
      empty.textContent = "No matching doctors found.";
      searchResults.append(empty);
    }

    searchResults.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchResults.hidden = true;
      searchInput.setAttribute("aria-expanded", "false");
      searchInput.blur();
    }
  });

  document.addEventListener("click", (event) => {
    if (!header.querySelector(".tc-site-search").contains(event.target)) {
      searchResults.hidden = true;
      searchInput.setAttribute("aria-expanded", "false");
    }
  });
})();
