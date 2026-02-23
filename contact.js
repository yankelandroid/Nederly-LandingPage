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
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    console.log('Form submitted:', data);

    // TODO: Replace with actual API call (e.g., fetch to backend or email service)
    // For now, simulate a successful submission
    contactForm.style.display = 'none';
    formSuccess.classList.add('visible');
  });
}

// Reset form
function resetForm() {
  contactForm.reset();
  contactForm.style.display = 'block';
  formSuccess.classList.remove('visible');
  synagogueFields.style.display = 'none';
}
