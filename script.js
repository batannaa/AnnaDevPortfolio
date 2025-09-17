// INTERNATIONALIZATION SETUP
i18next
  .use(i18nextHttpBackend)
  .use(i18nextBrowserLanguageDetector)
  .init(
    {
      fallbackLng: ["en", "fr"],
      debug: true,
      backend: {
        loadPath: "./locales/{{lng}}.json",
        crossDomain: false,
        allowMultiLoading: false,
        reloadInterval: false,
        requestOptions: {
          cache: "no-store",
          mode: "cors",
        },
      },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        lookupLocalStorage: "language",
        caches: ["localStorage"],
      },
      interpolation: {
        escapeValue: false,
      },
      returnEmptyString: false,
      returnNull: false,
      returnObjects: false,
      saveMissing: false,
    },
    function (err, t) {
      console.log("=== I18NEXT INITIALIZED ===");
      if (err) {
        console.error("i18next initialization error:", err);
      } else {
        console.log("i18next initialized successfully");
        console.log("Current language:", i18next.language);
        console.log(
          "Available resources:",
          i18next.services.resourceStore.data
        );

        updateContent();
        updateLanguageIndicator(i18next.language || "en");
        setTimeout(() => {
          startTypewriter();
          setTimeout(() => forceUpdateAllTranslations(), 100);
        }, 500);
      }
    }
  );

// TRANSLATION FUNCTIONS
function debugTranslations() {
  const currentLang = i18next.language;
  console.log("=== DEBUGGING TRANSLATIONS ===");
  console.log("Current language:", currentLang);
  console.log("Available resources:", i18next.getResourceBundle(currentLang));

  document.querySelectorAll("[data-i18n]").forEach((element, index) => {
    const key = element.getAttribute("data-i18n");
    const translation = i18next.t(key);
    const currentContent =
      element.innerHTML || element.placeholder || element.value;
    console.log(
      `${
        index + 1
      }. Key: "${key}" | Translation: "${translation}" | Current: "${currentContent}" | Element:`,
      element
    );
  });
  console.log("=== END DEBUG ===");
}

function forceUpdateAllTranslations() {
  console.log("Force updating translations for language:", i18next.language);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const translation = i18next.t(key);

    console.log(`Updating element with key "${key}": "${translation}"`);

    if (element.tagName === "INPUT" && element.type !== "submit") {
      element.placeholder = translation;
    } else if (element.tagName === "TEXTAREA") {
      element.placeholder = translation;
    } else {
      element.innerHTML = translation;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    const translation = i18next.t(key);
    console.log(`Updating placeholder with key "${key}": "${translation}"`);
    element.placeholder = translation;
  });

  if (typeof startTypewriter === "function") {
    setTimeout(() => startTypewriter(), 150);
  }
}

function updateContent() {
  forceUpdateAllTranslations();
}

function changeLanguage(lng) {
  console.log("=== CHANGING LANGUAGE ===");
  console.log("From:", i18next.language, "To:", lng);

  i18next
    .reloadResources([lng])
    .then(() => {
      return i18next.changeLanguage(lng);
    })
    .then(() => {
      console.log("Language changed to:", i18next.language);
      console.log("Available translations:", i18next.getResourceBundle(lng));

      forceUpdateAllTranslations();
      updateLanguageIndicator(lng);
      updateCurrentLangButton(lng);
      updateCVLink(lng);

      setTimeout(() => {
        console.log("First delayed update");
        forceUpdateAllTranslations();
      }, 100);

      setTimeout(() => {
        console.log("Second delayed update");
        forceUpdateAllTranslations();
      }, 300);

      setTimeout(() => {
        console.log("Final delayed update");
        forceUpdateAllTranslations();
      }, 500);
    })
    .catch((error) => {
      console.error("Language change failed:", error);

      i18next.changeLanguage(lng).then(() => {
        forceUpdateAllTranslations();
        updateLanguageIndicator(lng);
        updateCurrentLangButton(lng);
        updateCVLink(lng);
      });
    });
}

function updateCVLink(lng) {
  const cvBtn = document.getElementById("downloadCV");
  if (cvBtn) {
    cvBtn.href =
      lng === "fr"
        ? "./assets/images/Anna Batoochirova_web_fr.pdf"
        : "./assets/images/Anna Batoochirova_web_en.pdf";
  }
}

function updateLanguageIndicator(lng) {
  document
    .querySelectorAll(".lang-flag, .lang-switcher img")
    .forEach((flag) => {
      flag.classList.remove("active");
      flag.style.opacity = "0.6";
      flag.style.transform = "scale(1)";
    });

  const activeFlag = document.querySelector(
    `.lang-flag[onclick*="'${lng}'"], .lang-switcher img[onclick*="'${lng}'"]`
  );
  if (activeFlag) {
    activeFlag.classList.add("active");
    activeFlag.style.opacity = "1";
    activeFlag.style.transform = "scale(1.2)";
  }
}

function updateCurrentLangButton(lng) {
  const currentLangBtn = document.getElementById("currentLang");
  const flagUrls = {
    en: "https://flagcdn.com/w20/gb.png",
    fr: "https://flagcdn.com/w20/fr.png",
  };

  if (currentLangBtn) {
    const img = currentLangBtn.querySelector("img");
    if (img && flagUrls[lng]) {
      img.src = flagUrls[lng];
      img.alt = lng.toUpperCase();
    }
  }
}

// TYPEWRITER EFFECT
let typewriterTimeout;
function startTypewriter() {
  if (typewriterTimeout) clearTimeout(typewriterTimeout);

  const titleElement = document.getElementById("typewriter-text");
  if (!titleElement) return;

  const staticText = i18next.t("hero-title");
  const nameText = i18next.t("hero-name");
  const fullText = staticText + " " + nameText;

  titleElement.innerHTML = "";
  let charIndex = 0;

  function typeChar() {
    if (charIndex < fullText.length) {
      titleElement.innerHTML =
        fullText.substring(0, charIndex + 1) + '<span class="cursor">|</span>';
      charIndex++;
      typewriterTimeout = setTimeout(typeChar, 100);
    } else {
      setTimeout(() => (titleElement.innerHTML = fullText), 1000);
    }
  }

  typeChar();
}

// ORBITAL SKILLS SYSTEM
let orbitalAudioContext;
let orbitalMasterVolume = 0.7;
let orbitalCurrentOscillators = [];
let orbitsPaused = false;

const orbitalNoteFrequencies = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

const waveTypes = {
  core: "sine",
  orbit1: "triangle",
  orbit2: "square",
  orbit3: "sawtooth",
  html: "triangle",
  css: "sine",
  js: "sawtooth",
  react: "sine",
  node: "square",
  angular: "triangle",
  python: "sawtooth",
  git: "sine",
  typescript: "triangle",
  csharp: "square",
  database: "sine",
  postman: "triangle",
};

function initOrbitalAudio() {
  if (!orbitalAudioContext) {
    orbitalAudioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
  }
}

function playOrbitalNote(
  frequency,
  duration = 2,
  waveType = "sine",
  gain = 0.25
) {
  if (!orbitalAudioContext) return;

  const oscillator = orbitalAudioContext.createOscillator();
  const gainNode = orbitalAudioContext.createGain();
  const filterNode = orbitalAudioContext.createBiquadFilter();

  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(orbitalAudioContext.destination);

  oscillator.frequency.setValueAtTime(
    frequency,
    orbitalAudioContext.currentTime
  );
  oscillator.type = waveType;

  filterNode.type = "lowpass";
  filterNode.frequency.setValueAtTime(4000, orbitalAudioContext.currentTime);

  gainNode.gain.setValueAtTime(0, orbitalAudioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    orbitalMasterVolume * gain,
    orbitalAudioContext.currentTime + 0.1
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    orbitalAudioContext.currentTime + duration
  );

  oscillator.start(orbitalAudioContext.currentTime);
  oscillator.stop(orbitalAudioContext.currentTime + duration);

  orbitalCurrentOscillators.push(oscillator);
  setTimeout(() => {
    const index = orbitalCurrentOscillators.indexOf(oscillator);
    if (index > -1) orbitalCurrentOscillators.splice(index, 1);
  }, duration * 1000);
}

function createSoundWave(planet) {
  const wave = document.createElement("div");
  wave.className = "sound-wave";
  planet.appendChild(wave);
  setTimeout(() => {
    if (planet.contains(wave)) planet.removeChild(wave);
  }, 2000);
}

function playSkillSound(planet) {
  initOrbitalAudio();

  const sound = planet.dataset.sound;
  const skill = planet.dataset.skill || "core";
  const frequency = orbitalNoteFrequencies[sound];

  if (frequency) {
    playOrbitalNote(frequency, 2.5, waveTypes[skill] || "sine", 0.2);
    planet.classList.add("active");
    createSoundWave(planet);
    setTimeout(() => planet.classList.remove("active"), 2200);
  }
}

function playOrbitalSequence() {
  const sequence = [
    ".planet-html",
    ".planet-css",
    ".planet-js",
    ".planet-react",
    ".planet-node",
    ".planet-angular",
    ".planet-typescript",
    ".planet-python",
    ".planet-csharp",
    ".planet-git",
    ".planet-database",
    ".planet-postman",
  ];

  sequence.forEach((selector, index) => {
    setTimeout(() => {
      const planet = document.querySelector(selector);
      if (planet) playSkillSound(planet);
    }, index * 500);
  });
}

function playGravityWell() {
  document.querySelectorAll(".skill-planet").forEach((planet, index) => {
    setTimeout(() => playSkillSound(planet), index * 100);
  });

  setTimeout(() => {
    const core = document.querySelector(".core");
    if (core) playSkillSound(core);
  }, 1000);
}

function pauseOrbits() {
  const orbits = document.querySelectorAll(".orbit");
  const btn = event.target.closest(".control-btn");

  if (orbitsPaused) {
    orbits.forEach((orbit) => (orbit.style.animationPlayState = "running"));
    if (btn) {
      const span = btn.querySelector("span");
      const icon = btn.querySelector("i");
      if (span) {
        const pauseText =
          i18next.t("pauseOrbits") ||
          i18next.t("Pause Orbits") ||
          "Pause Orbits";
        span.textContent = pauseText;
      }
      if (icon) icon.className = "fas fa-pause";
    }
    orbitsPaused = false;
  } else {
    orbits.forEach((orbit) => (orbit.style.animationPlayState = "paused"));
    if (btn) {
      const span = btn.querySelector("span");
      const icon = btn.querySelector("i");
      if (span) {
        const resumeText = i18next.t("resumeOrbits") || "Resume Orbits";
        span.textContent = resumeText;
      }
      if (icon) icon.className = "fas fa-play";
    }
    orbitsPaused = true;
  }
}

function stopAll() {
  orbitalCurrentOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch (e) {}
  });
  orbitalCurrentOscillators = [];
  document.querySelectorAll(".skill-planet, .core").forEach((planet) => {
    planet.classList.remove("active");
  });
}

function initOrbitalSkills() {
  document.querySelectorAll(".skill-planet").forEach((planet) => {
    planet.addEventListener("click", () => playSkillSound(planet));
    planet.addEventListener("mouseenter", () => {
      initOrbitalAudio();
      const frequency = orbitalNoteFrequencies[planet.dataset.sound];
      if (frequency && orbitalMasterVolume > 0) {
        playOrbitalNote(frequency * 0.8, 0.5, "sine", 0.1);
      }
    });
  });

  const core = document.querySelector(".core");
  if (core) {
    core.addEventListener("click", () => playSkillSound(core));
  }

  document.addEventListener("click", () => {
    if (orbitalAudioContext && orbitalAudioContext.state === "suspended") {
      orbitalAudioContext.resume();
    }
  });

  // Welcome sound sequence
  setTimeout(() => {
    if (orbitalMasterVolume > 0) {
      initOrbitalAudio();
      [261.63, 329.63, 392.0, 523.25].forEach((freq, index) => {
        setTimeout(() => playOrbitalNote(freq, 1.5, "sine", 0.15), index * 200);
      });
    }
  }, 2000);
}

// InITIALIZATION OF COPYRIGHT EFFECTS
function initCopyrightEffects() {
  const copyrightElement = document.querySelector(".copyright-modern");
  if (!copyrightElement) return;

  // Update year
  updateCopyrightYear();

  // Add simple effects
  addHeartHoverEffects(copyrightElement);
  addSparkleClickEffect(copyrightElement);
}

// Automatic heart explosion on hover over heart
function addHeartHoverEffects(element) {
  const heartIcon = element.querySelector(".heart-icon");

  if (heartIcon) {
    let hoverTimeout;

    heartIcon.addEventListener("mouseenter", () => {
      // Quick heart explosion without delay
      hoverTimeout = setTimeout(() => {
        createHeartExplosion(heartIcon);
      }, 300); // Short delay of 0.3 seconds
    });

    heartIcon.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout);
    });
  }
}

// Sparkle effect on click for copyright
function addSparkleClickEffect(element) {
  element.addEventListener("click", () => {
    // Add sparkle class
    element.classList.add("sparkle");

    // Remove after 2 seconds
    setTimeout(() => {
      element.classList.remove("sparkle");
    }, 2000);
  });
}

// Quick heart explosion
function createHeartExplosion(heartElement) {
  const hearts = ["💖", "💝", "💗", "💓", "💕", "❤️", "💘"];
  const container = heartElement.closest(".copyright-modern");

  // Create 6 hearts for quick effect
  for (let i = 0; i < 6; i++) {
    const floatingHeart = document.createElement("span");
    floatingHeart.textContent =
      hearts[Math.floor(Math.random() * hearts.length)];
    floatingHeart.className = "floating-heart";

    // Positioning relative to the heart
    const rect = heartElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    floatingHeart.style.cssText = `
      position: absolute;
      left: ${rect.left - containerRect.left + rect.width / 2}px;
      top: ${rect.top - containerRect.top + rect.height / 2}px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
      animation: floatAway ${0.8 + Math.random() * 0.4}s ease-out forwards;
      animation-delay: ${Math.random() * 0.2}s;
      transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
    `;

    container.style.position = "relative";
    container.appendChild(floatingHeart);

    // Remove after animation
    setTimeout(() => {
      if (floatingHeart.parentNode) {
        floatingHeart.remove();
      }
    }, 1200);
  }
}

// Simple year update
function updateCopyrightYear() {
  const yearElement = document.querySelector('[data-i18n="copyright-year"]');
  if (yearElement) {
    const currentYear = new Date().getFullYear();
    if (yearElement.textContent !== currentYear.toString()) {
      yearElement.textContent = currentYear;
    }
  }
}

// CORE FUNCTIONALITY
function initNavigation() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  // Handle navigation clicks
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      navLinks.forEach((navLink) => navLink.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Handle scroll-based active state
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  });
}

function initMobileMenu() {
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const navMain = document.querySelector(".nav-main");
  const navbar = document.getElementById("navbar");

  if (!mobileMenuToggle || !navMain) return;

  mobileMenuToggle.addEventListener("click", function () {
    mobileMenuToggle.classList.toggle("active");
    navMain.classList.toggle("mobile-open");
    document.body.style.overflow = navMain.classList.contains("mobile-open")
      ? "hidden"
      : "";
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function () {
      mobileMenuToggle.classList.remove("active");
      navMain.classList.remove("mobile-open");
      document.body.style.overflow = "";
    });
  });

  document.addEventListener("click", function (e) {
    if (!navbar.contains(e.target)) {
      mobileMenuToggle.classList.remove("active");
      navMain.classList.remove("mobile-open");
      document.body.style.overflow = "";
    }
  });
}

function initScrollEffects() {
  // Progress Bar
  window.addEventListener("scroll", () => {
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = progress + "%";
    }

    // Navbar effect
    const navbar = document.getElementById("navbar");
    if (navbar) {
      navbar.style.background =
        window.scrollY > 100
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(255, 255, 255, 0.1)";
      if (window.scrollY > 100) {
        navbar.style.backdropFilter = "blur(20px)";
      }
    }

    // Parallax effect
    const heroBackground = document.querySelector(".hero-bg");
    if (heroBackground) {
      heroBackground.style.transform = `translateY(${
        window.pageYOffset * 0.5
      }px)`;
    }
  });
}

// THEME FUNCTIONALITY WITH LOCALSTORAGE
function loadSavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  const themeToggle = document.getElementById("themeToggle");

  if (savedTheme === "light") {
    document.body.classList.add("light");
    if (themeToggle) {
      const icon = themeToggle.querySelector("i");
      if (icon) {
        icon.className = "fas fa-sun";
      }
    }
  } else {
    document.body.classList.remove("light");
    if (themeToggle) {
      const icon = themeToggle.querySelector("i");
      if (icon) {
        icon.className = "fas fa-moon";
      }
    }
  }
}

function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

  themeToggle.addEventListener("click", () => {
    const isCurrentlyLight = document.body.classList.contains("light");

    if (isCurrentlyLight) {
      document.body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    }

    const icon = themeToggle.querySelector("i");
    if (icon) {
      icon.className = document.body.classList.contains("light")
        ? "fas fa-sun"
        : "fas fa-moon";
    }
  });
}

function initFormHandling() {
  const form = document.querySelector("form");
  const submitBtn = document.querySelector(".form-submit");

  if (form && submitBtn) {
    form.addEventListener("submit", (e) => {
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          form.reset();
        }, 2000);
      }, 2000);
    });
  }
}

function initInteractiveElements() {
  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Interactive card
  const interactiveCard = document.querySelector(".interactive-card");
  if (interactiveCard) {
    interactiveCard.addEventListener("click", () => {
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Typewriter effect on hover over About section
  const heroSection = document.getElementById("hero");
  if (heroSection) {
    heroSection.addEventListener("mouseenter", () => {
      startTypewriter();
    });
  }
}

function generateCosmicDust() {
  const solarSystem = document.getElementById("solarSystem");
  if (!solarSystem) return;

  const types = ["large", "medium", "small"];
  const colors = ["", "blue", "purple", "gold"];

  for (let i = 0; i < 20; i++) {
    const dust = document.createElement("div");
    const type = types[Math.floor(Math.random() * types.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];

    dust.className = `cosmic-dust ${type} ${color}`;
    dust.style.top = `${Math.random() * 100}%`;
    dust.style.left = `${Math.random() * 100}%`;
    dust.style.animationDelay = `${Math.random() * 15}s`;

    solarSystem.appendChild(dust);
  }
}

// EVENT LISTENERS
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => preloader.classList.add("hide"), 1500);
  }
});

// INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  // load theme from localStorage
  loadSavedTheme();

  // Initialize all components
  setTimeout(() => initOrbitalSkills(), 100);
  initNavigation();
  initMobileMenu();
  initScrollEffects();
  initThemeToggle();
  initFormHandling();
  initInteractiveElements();
  generateCosmicDust();

  // ИНИЦИАЛИЗАЦИЯ УПРОЩЕННОГО КОПИРАЙТА
  initCopyrightEffects();

  // Language dropdown handlers with enhanced update and debugging
  document.querySelectorAll(".lang-option").forEach((option) => {
    option.addEventListener("click", function (e) {
      e.preventDefault();
      const lang = this.getAttribute("data-lang");

      console.log("=== LANGUAGE OPTION CLICKED ===");
      console.log("Clicked language:", lang);
      console.log("Current language:", i18next.language);

      // verify if the selected language is different
      const currentLang = i18next.language;
      if (currentLang === lang) {
        console.log("Same language, forcing refresh anyway");
        forceUpdateAllTranslations();
        return;
      }

      changeLanguage(lang);

      setTimeout(() => {
        console.log("Click handler: delayed update 1");
        forceUpdateAllTranslations();
        updateLanguageIndicator(lang);
        updateCurrentLangButton(lang);
      }, 200);

      setTimeout(() => {
        console.log("Click handler: delayed update 2");
        forceUpdateAllTranslations();
      }, 600);

      setTimeout(() => {
        console.log("Click handler: delayed update 3");
        forceUpdateAllTranslations();
      }, 1000);
    });
  });

  updateCurrentLangButton(i18next.language || "en");

  // Expose debugging functions globally
  window.debugTranslations = debugTranslations;
  window.forceUpdateAllTranslations = forceUpdateAllTranslations;
  window.diagnoseProblem = function () {
    console.log("=== FULL DIAGNOSTIC ===");
    console.log("Current i18next language:", i18next.language);
    console.log("Browser language:", navigator.language);
    console.log(
      "Available languages in i18next:",
      Object.keys(i18next.services.resourceStore.data)
    );

    ["en", "fr"].forEach((lang) => {
      console.log(`=== RESOURCES FOR ${lang.toUpperCase()} ===`);
      const resources = i18next.getResourceBundle(lang);
      console.log(resources);

      const testKeys = ["hero-title", "hero-name", "nav-about", "nav-skills"];
      testKeys.forEach((key) => {
        const translation = i18next.t(key, { lng: lang });
        console.log(`${lang} - ${key}: "${translation}"`);
      });
    });

    console.log("=== DOM ELEMENTS ===");
    debugTranslations();
    console.log("=== END FULL DIAGNOSTIC ===");
  };

  setTimeout(() => {
    console.log("Running automatic diagnostic...");
    window.diagnoseProblem();
  }, 3000);
});

// I18NEXT EVENT HANDLERS
i18next.on("languageChanged", function (lng) {
  console.log("=== LANGUAGE CHANGED EVENT ===", lng);
  setTimeout(() => {
    console.log("Event handler: updating translations");
    forceUpdateAllTranslations();
    updateCVLink(lng);
    updateLanguageIndicator(lng);
    updateCurrentLangButton(lng);
  }, 10);

  setTimeout(() => {
    console.log("Event handler: second update");
    forceUpdateAllTranslations();
  }, 150);

  setTimeout(() => {
    console.log("Event handler: third update");
    forceUpdateAllTranslations();
  }, 400);
});

i18next.on("initialized", function () {
  console.log("=== I18N INITIALIZED ===");
  forceUpdateAllTranslations();
});

i18next.on("loaded", function (loaded) {
  console.log("=== I18N RESOURCES LOADED ===", loaded);
  forceUpdateAllTranslations();
});

i18next.on("failedLoading", function (lng, ns, msg) {
  console.error("=== I18N FAILED LOADING ===", lng, ns, msg);
});

i18next.on("missingKey", function (lng, namespace, key, res) {
  console.warn("=== I18N MISSING KEY ===", lng, namespace, key, res);
});
