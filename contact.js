// ============================================
// CONTACT PAGE SCRIPTS
// ============================================

// Show/hide synagogue name field based on subject
const subjectSelect = document.getElementById('subject');
const synagogueFields = document.getElementById('synagogueFields');

if (subjectSelect) {
  subjectSelect.addEventListener('change', (e) => {
    if (e.target.value === 'synagogue') {
      synagogueFields.style.display = 'block';
      synagogueFields.querySelector('input').setAttribute('required', 'true');
    } else {
      synagogueFields.style.display = 'none';
      synagogueFields.querySelector('input').removeAttribute('required');
    }
  });
}

// Form submission
const CONTACT_ENDPOINT = 'https://api.nederly.io/api/contact';

// Messages de l'envoi : en hébreu sur he/contact.html
const contactIsHebrew = document.documentElement.lang === 'he';

const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');
const submitButton = contactForm ? contactForm.querySelector('[type="submit"]') : null;
const submitButtonLabel = submitButton ? submitButton.innerHTML : '';

function showFormError(message) {
  if (!formError) return;
  formError.textContent = message;
  formError.classList.add('visible');
}

function hideFormError() {
  if (!formError) return;
  formError.classList.remove('visible');
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // The synagogue name field is hidden for most subjects; sending an empty
    // string would fail the API's optional-string validation.
    if (!data.synagogueName) {
      delete data.synagogueName;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = contactIsHebrew ? 'שולחים…' : 'Envoi en cours…';
    }

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      contactForm.style.display = 'none';
      formSuccess.classList.add('visible');
    } catch (error) {
      // Never pretend the message went through: the visitor must know to use
      // the email address in the sidebar instead.
      showFormError(contactIsHebrew
        ? 'לא הצלחנו לשלוח את ההודעה. נסו שוב בעוד רגע או כתבו לנו ישירות ל־contact@nederly.io.'
        : "Votre message n'a pas pu être envoyé. Réessayez dans un instant ou écrivez-nous directement à contact@nederly.io."
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = submitButtonLabel;
      }
    }
  });
}

// Reset form
function resetForm() {
  contactForm.reset();
  contactForm.style.display = 'block';
  formSuccess.classList.remove('visible');
  synagogueFields.style.display = 'none';
  hideFormError();
}

// Spotlight tracking on info cards
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.contact-info-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();
