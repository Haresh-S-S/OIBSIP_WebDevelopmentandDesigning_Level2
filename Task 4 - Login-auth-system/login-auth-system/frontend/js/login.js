/**
 * login.js
 * ---------------------------------------------------------
 * Handles client-side validation and submission logic for
 * the login form. Communicates with the backend via fetch()
 * and redirects to the dashboard on success.
 * ---------------------------------------------------------
 */

const API_BASE = '';

// ---- Element references ----
const form = document.getElementById('loginForm');
const identifierInput = document.getElementById('identifier');
const passwordInput = document.getElementById('password');
const identifierError = document.getElementById('identifierError');
const passwordError = document.getElementById('passwordError');
const loginBtn = document.getElementById('loginBtn');
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
// Client-side validation
// ---------------------------------------------------------
function clearErrors() {
  identifierError.textContent = '';
  passwordError.textContent = '';
  identifierInput.classList.remove('input-error');
  passwordInput.classList.remove('input-error');
}

function validateForm() {
  let isValid = true;
  clearErrors();

  if (!identifierInput.value.trim()) {
    identifierError.textContent = 'Username or email is required.';
    identifierInput.classList.add('input-error');
    isValid = false;
  }

  if (!passwordInput.value) {
    passwordError.textContent = 'Password is required.';
    passwordInput.classList.add('input-error');
    isValid = false;
  }

  return isValid;
}

function setButtonLoading(button, isLoading) {
  button.disabled = isLoading;
  button.classList.toggle('loading', isLoading);
}

// ---------------------------------------------------------
// Check if user already has an active session -> redirect
// straight to the dashboard (session persists across refresh)
// ---------------------------------------------------------
(async function checkExistingSession() {
  try {
    const response = await fetch(`${API_BASE}/dashboard`, {
      method: 'GET',
      credentials: 'include'
    });
    if (response.ok) {
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    // Silently ignore - user simply stays on the login page
  }
})();

// ---------------------------------------------------------
// Form submission
// ---------------------------------------------------------
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const payload = {
    identifier: identifierInput.value.trim(),
    password: passwordInput.value
  };

  setButtonLoading(loginBtn, true);

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success) {
      showToast(data.message || 'Login successful!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    } else {
      // Generic error - never reveal which field was wrong
      identifierError.textContent = data.message;
      passwordError.textContent = data.message;
      identifierInput.classList.add('input-error');
      passwordInput.classList.add('input-error');
      showToast(data.message || 'Login failed.', 'error');
    }
  } catch (err) {
    console.error('Login request failed:', err);
    showToast('Something went wrong. Please try again.', 'error');
  } finally {
    setButtonLoading(loginBtn, false);
  }
});

// ---------------------------------------------------------
// Enter key support
// ---------------------------------------------------------
[identifierInput, passwordInput].forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      form.requestSubmit();
    }
  });
});
