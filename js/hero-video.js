/* Clubs for Love: fairway hero video. Honour reduced motion; swap poster by breakpoint. */
(function () {
  var hero = document.querySelector(".hero");
  if (!hero) return;
  var video = hero.querySelector(".hero-video");
  if (!video) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobile = window.matchMedia("(max-width: 767px)");

  function applyPoster() {
    var desktop = video.getAttribute("data-poster-desktop");
    var mob = video.getAttribute("data-poster-mobile");
    if (!desktop && !mob) return;
    video.poster = mobile.matches && mob ? mob : (desktop || mob);
  }

  function syncMotion() {
    applyPoster();
    if (reduce.matches) {
      try { video.pause(); } catch (e) {}
      video.removeAttribute("autoplay");
      return;
    }
    video.setAttribute("autoplay", "");
    var play = video.play();
    if (play && typeof play.catch === "function") play.catch(function () {});
  }

  syncMotion();
  if (typeof reduce.addEventListener === "function") reduce.addEventListener("change", syncMotion);
  else if (typeof reduce.addListener === "function") reduce.addListener(syncMotion);
  if (typeof mobile.addEventListener === "function") mobile.addEventListener("change", applyPoster);
  else if (typeof mobile.addListener === "function") mobile.addListener(applyPoster);
})();
