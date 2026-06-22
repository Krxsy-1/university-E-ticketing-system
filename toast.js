// toast.js
// Centralized toast notification helper
(function (window, document) {
  const containerId = 'toastContainer';

  function ensureContainer() {
    let c = document.getElementById(containerId);
    if (!c) {
      c = document.createElement('div');
      c.id = containerId;
      c.className = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(title, message = '', type = 'info', duration = 4000) {
    const container = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fa-solid ${iconMap[type]}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Close notification">
        <i class="fa-solid fa-times"></i>
      </button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    const removeToast = () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', removeToast);

    if (duration > 0) {
      setTimeout(removeToast, duration);
    }

    return { element: toast, close: removeToast };
  }

  window.showToast = showToast;
  window.showSuccess = (t, m = '') => showToast(t, m, 'success', 4000);
  window.showError = (t, m = '') => showToast(t, m, 'error', 5000);
  window.showWarning = (t, m = '') => showToast(t, m, 'warning', 4000);
  window.showInfo = (t, m = '') => showToast(t, m, 'info', 4000);

})(window, document);
