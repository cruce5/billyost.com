// Runs in <head> before first paint so a stored theme never flashes.
// Dark is the default; with nothing stored the page follows the OS.
// The toggle cycles dark -> light -> rainbow -> dark.
(function () {
  var KEY = 'billyost-theme';
  var ORDER = ['dark', 'light', 'rainbow'];
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (ORDER.indexOf(stored) !== -1) root.setAttribute('data-theme', stored);

  function current() {
    var t = root.getAttribute('data-theme');
    if (ORDER.indexOf(t) !== -1) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function next() { return ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length]; }

  document.addEventListener('DOMContentLoaded', function () {
    var btns = document.querySelectorAll('[data-theme-toggle]');
    function sync() {
      var n = next();
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute('aria-label', 'Switch to ' + n + ' mode');
        btns[i].querySelector('[data-theme-label]').textContent = n + ' mode';
      }
    }
    sync();
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        var n = next();
        root.setAttribute('data-theme', n);
        try { localStorage.setItem(KEY, n); } catch (e) {}
        sync();
      });
    }
  });
})();
