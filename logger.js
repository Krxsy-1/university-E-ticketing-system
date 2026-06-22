// logger.js - simple gated logger for development
(function (window) {
  const DEBUG = window.__UNITICKETS_DEBUG__ || false;

  function log(...args) { if (DEBUG) console.log('[LOG]', ...args); }
  function info(...args) { if (DEBUG) console.info('[INFO]', ...args); }
  function warn(...args) { if (DEBUG) console.warn('[WARN]', ...args); }
  function error(...args) { if (DEBUG) console.error('[ERROR]', ...args); }

  window.logger = { log, info, warn, error };
})(window);
