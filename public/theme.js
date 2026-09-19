// Runs in <head> before first paint so a stored theme never flashes.
// Dark is the default; with nothing stored the page follows the OS.
// Three swatch buttons ([data-theme-choice="dark|light|rainbow"]) pick a theme directly.
(function () {
  var KEY = 'billyost-theme';
  var THEMES = ['dark', 'light', 'rainbow'];
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (THEMES.indexOf(stored) !== -1) root.setAttribute('data-theme', stored);

  // A hidden tab stops animating (rainbow mode runs several infinite animations).
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) root.setAttribute('data-paused', '');
    else root.removeAttribute('data-paused');
  });

  function current() {
    var t = root.getAttribute('data-theme');
    if (THEMES.indexOf(t) !== -1) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btns = document.querySelectorAll('[data-theme-choice]');
    var status = document.querySelector('[data-theme-status]');
    function sync() {
      var c = current();
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-theme-choice') === c ? 'true' : 'false');
      }
    }
    sync();
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (e) {
        var t = e.currentTarget.getAttribute('data-theme-choice');
        root.setAttribute('data-theme', t);
        try { localStorage.setItem(KEY, t); } catch (err) {}
        if (status) status.textContent = t.charAt(0).toUpperCase() + t.slice(1) + ' mode on.';
        sync();
      });
    }
  });
})();
