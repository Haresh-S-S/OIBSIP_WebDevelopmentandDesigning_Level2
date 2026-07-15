/**
 * dashboard.js
 * ---------------------------------------------------------
 * Fetches the logged-in user's data from the protected
 * /dashboard endpoint. Redirects to login if unauthorized.
 * Handles the logout button.
 * ---------------------------------------------------------
 */

const API_BASE = '';

const usernameValue = document.getElementById('usernameValue');
const emailValue = document.getElementById('emailValue');
const loginTimeValue = document.getElementById('loginTimeValue');
const createdAtValue = document.getElementById('createdAtValue');
const welcomeHeading = document.getElementById('welcomeHeading');
const avatarInitial = document.getElementById('avatarInitial');
const logoutBtn = document.getElementById('logoutBtn');
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

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (err) {
    return isoString;
  }
}

function formatTime(date) {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ---------------------------------------------------------
// Load user data on page load
// ---------------------------------------------------------
async function loadDashboard() {
  try {
    const response = await fetch(`${API_BASE}/dashboard`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 401) {
      // Not authenticated - send back to login
      window.location.href = 'login.html';
      return;
    }

    const data = await response.json();

    if (!data.success) {
      window.location.href = 'login.html';
      return;
    }

    const { username, email, createdAt } = data.user;

    welcomeHeading.textContent = `Welcome, ${username}!`;
    usernameValue.textContent = username;
    emailValue.textContent = email;
    createdAtValue.textContent = formatDate(createdAt);
    loginTimeValue.textContent = formatTime(new Date());
    avatarInitial.textContent = username.charAt(0).toUpperCase();
  } catch (err) {
    console.error('Failed to load dashboard:', err);
    showToast('Could not load your data. Redirecting to login...', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  }
}

// ---------------------------------------------------------
// Logout handling
// ---------------------------------------------------------
logoutBtn.addEventListener('click', async () => {
  logoutBtn.disabled = true;
  logoutBtn.classList.add('loading');

  try {
    const response = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      showToast('Logged out successfully.', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 600);
    } else {
      showToast(data.message || 'Could not log out.', 'error');
      logoutBtn.disabled = false;
      logoutBtn.classList.remove('loading');
    }
  } catch (err) {
    console.error('Logout request failed:', err);
    showToast('Something went wrong. Please try again.', 'error');
    logoutBtn.disabled = false;
    logoutBtn.classList.remove('loading');
  }
});

// Kick off data load
loadDashboard();
