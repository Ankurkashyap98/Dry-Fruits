/* ==========================================================================
   NUTORIA — CONTACT PAGE CONTROLLER
   Real-Time Form Validation, Simulated Dispatch & Toast Confirmation
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initConciergeForm();
  });

  function initConciergeForm() {
    const form = document.getElementById('concierge-contact-form');
    if (!form) return;

    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const phoneInput = document.getElementById('form-phone');
    const subjectSelect = document.getElementById('form-subject');
    const messageInput = document.getElementById('form-message');
    const submitBtn = document.getElementById('form-submit-btn');

    // Real-time input validation listeners
    [nameInput, emailInput, phoneInput, messageInput].forEach(field => {
      if (field) {
        field.addEventListener('input', () => validateField(field));
        field.addEventListener('blur', () => validateField(field));
      }
    });

    if (subjectSelect) {
      subjectSelect.addEventListener('change', () => validateField(subjectSelect));
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput);
      const isEmailValid = validateField(emailInput);
      const isPhoneValid = validateField(phoneInput);
      const isSubjectValid = validateField(subjectSelect);
      const isMessageValid = validateField(messageInput);

      if (isNameValid && isEmailValid && isPhoneValid && isSubjectValid && isMessageValid) {
        // Dispatch simulation
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Transmitting to Concierge...';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          form.reset();

          // Clear validation states
          [nameInput, emailInput, phoneInput, subjectSelect, messageInput].forEach(f => {
            if (f) f.classList.remove('is-invalid');
          });

          showToast('Inquiry Registered', 'Thank you. Our Private Client Concierge will contact you within 4 business hours.', 'success');
        }, 1200);
      } else {
        showToast('Incomplete Inquiry', 'Please review the highlighted fields before submitting.', 'error');
      }
    });

    function validateField(field) {
      if (!field) return true;
      let valid = true;
      const val = field.value.trim();

      if (field === nameInput) {
        valid = val.length >= 2;
      } else if (field === emailInput) {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      } else if (field === phoneInput) {
        valid = /^[0-9+\s\-()]{7,15}$/.test(val);
      } else if (field === subjectSelect) {
        valid = val !== '';
      } else if (field === messageInput) {
        valid = val.length >= 10;
      }

      if (!valid) {
        field.classList.add('is-invalid');
      } else {
        field.classList.remove('is-invalid');
      }

      return valid;
    }
  }

})();
