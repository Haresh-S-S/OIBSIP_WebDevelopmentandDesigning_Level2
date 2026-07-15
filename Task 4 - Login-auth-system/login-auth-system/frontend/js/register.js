/**
 * register.js
 * ---------------------------------------------------------
 * Handles client-side validation and submission logic for
 * the registration form. Communicates with the backend via
 * fetch() and shows inline errors + toast notifications.
 * ---------------------------------------------------------
 */

const API_BASE = ''; // same-origin, backend serves the frontend

// ---- Element references ----
const form = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const usernameError = document.getElementById('usernameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const registerBtn = document.getElementById('registerBtn');
const togglePasswordBtn = document.getElementById('togglePassword');
const toastContainer = document.getElementById('toastContainer');

// ---------------------------------------------------------
// Toast notification helper
// ---------------------------------------------------------
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast--hide');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---------------------------------------------------------
// Password visibility toggle
// ---------------------------------------------------------
togglePasswordBtn.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
});

// ---------------------------------------------------------
// Client-side validation helpers
// ---------------------------------------------------------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePasswordStrength(password) {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasLength = password.length >= 8;
  return hasUpper && hasLower && hasNumber && hasLength;
}

function clearErrors() {
  usernameError.textContent = '';
  emailError.textContent = '';
  passwordError.textContent = '';
  usernameInput.classList.remove('input-error');
  emailInput.classList.remove('input-error');
  passwordInput.classList.remove('input-error');
}

function validateForm() {
  let isValid = true;
  clearErrors();

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!username) {
    usernameError.textContent = 'Username is required.';
    usernameInput.classList.add('input-error');
    isValid = false;
  } else if (username.length < 3) {
    usernameError.textContent = 'Username must be at least 3 characters.';
    usernameInput.classList.add('input-error');
    isValid = false;
  }

  if (!email) {
    emailError.textContent = 'Email is required.';
    emailInput.classList.add('input-error');
    isValid = false;
  } else if (!EMAIL_REGEX.test(email)) {
    emailError.textContent = 'Please enter a valid email address.';
    emailInput.classList.add('input-error');
    isValid = false;
  }

  if (!password) {
    passwordError.textContent = 'Password is required.';
    passwordInput.classList.add('input-error');
    isValid = false;
  } else if (!validatePasswordStrength(password)) {
    passwordError.textContent =
      'Password needs 8+ characters, an uppercase letter, a lowercase letter, and a number.';
    passwordInput.classList.add('input-error');
    isValid = false;
  }

  return isValid;
}

// ---------------------------------------------------------
// Button loading state helper
// ---------------------------------------------------------
function setButtonLoading(button, isLoading) {
  button.disabled = isLoading;
  button.classList.toggle('loading', isLoading);
}

// ---------------------------------------------------------
// Form submission
// ---------------------------------------------------------
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return; // Do not send request if client-side validation fails
  }

  const payload = {
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value
  };

  setButtonLoading(registerBtn, true);

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success) {
      showToast(data.message || 'Registration successful!', 'success');
      form.reset();
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    } else {
      // Highlight the relevant field based on the backend message
      if (/username/i.test(data.message)) {
        usernameError.textContent = data.message;
        usernameInput.classList.add('input-error');
      } else if (/email/i.test(data.message)) {
        emailError.textContent = data.message;
        emailInput.classList.add('input-error');
      }
      showToast(data.message || 'Registration failed.', 'error');
    }
  } catch (err) {
    console.error('Registration request failed:', err);
    showToast('Something went wrong. Please try again.', 'error');
  } finally {
    setButtonLoading(registerBtn, false);
  }
});

// ---------------------------------------------------------
// Enter key support (native form submission already handles
// Enter, but we ensure inputs don't get blocked by anything)
// ---------------------------------------------------------
[usernameInput, emailInput, passwordInput].forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      form.requestSubmit();
    }
  });
});
