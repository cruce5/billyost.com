// Runs in <head> before first paint so a stored theme never flashes.
// Dark is the default; with nothing stored the page follows the OS.
// [data-theme-toggle] cycles dark -> light -> rainbow -> dark.
// [data-theme-set="rainbow"] jumps straight to rainbow, and back to dark from rainbow,
// because nobody clicks a "light mode" button twice to find out what comes next.
(function () {
  var KEY = 'billyost-theme';
  var ORDER = ['dark', 'light', 'rainbow'];
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (ORDER.indexOf(stored) !== -1) root.setAttribute('data-theme', stored);

  // A hidden tab stops animating (rainbow mode runs several infinite animations).
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) root.setAttribute('data-paused', '');
    else root.removeAttribute('data-paused');
  });

  function current() {
    var t = root.getAttribute('data-theme');
    if (ORDER.indexOf(t) !== -1) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function next() { return ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length]; }
  function target(btn) {
    var want = btn.getAttribute('data-theme-set');
    if (!want) return next();
    return current() === want ? 'dark' : want;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btns = document.querySelectorAll('[data-theme-toggle],[data-theme-set]');
    var status = document.querySelector('[data-theme-status]');
    function sync() {
      for (var i = 0; i < btns.length; i++) {
        var t = target(btns[i]);
        btns[i].setAttribute('aria-label', 'Switch to ' + t + ' mode');
        btns[i].querySelector('[data-theme-label]').textContent = t + ' mode';
      }
    }
    sync();
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (e) {
        var t = target(e.currentTarget);
        root.setAttribute('data-theme', t);
        try { localStorage.setItem(KEY, t); } catch (err) {}
        if (status) status.textContent = t.charAt(0).toUpperCase() + t.slice(1) + ' mode on.';
        sync();
      });
    }
  });
})();
