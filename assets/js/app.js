/* aletia — kleine Interaktionen, damit nichts „tot“ wirkt. */
(function () {
  "use strict";

  // Mobile-Menü
  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".mainnav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    // Klick auf Link: Menü schließen UND normal navigieren (kein preventDefault!)
    nav.querySelectorAll(".navlink").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
    // Außerhalb klicken schließt
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") &&
          !nav.contains(e.target) && !burger.contains(e.target)) {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Toast — wiederverwendbares Feedback
  var toastEl = null, toastTimer = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    // reflow, dann einblenden
    void toastEl.offsetWidth;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 3400);
  }

  // Hero-Suche = „Entdecken/Early-Access“-CTA → echtes Bestätigungs-Feedback
  var search = document.querySelector(".search");
  if (search) {
    search.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = search.querySelector(".search-input");
      search.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0.99)" }, { transform: "scale(1)" }],
        { duration: 180 }
      );
      showToast("Vielen Dank — wir halten Sie über die Zukunft des Fliegens auf dem Laufenden.");
      if (input) { input.value = ""; input.blur(); }
    });
  }

  // Projektpräsentation — Folien durchblättern (wie PDF)
  var pres = document.querySelector(".pres");
  if (pres) {
    var total = parseInt(pres.getAttribute("data-total"), 10) || 0;
    var pimg = pres.querySelector(".pres-img");
    var pcur = pres.querySelector(".pres-cur");
    var dotsWrap = pres.querySelector(".pres-dots");
    var idx = 0, dots = [];
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    for (var k = 0; k < total; k++) {
      var b = document.createElement("button");
      b.className = "pres-dot"; b.type = "button";
      b.setAttribute("aria-label", "Folie " + (k + 1));
      (function (n) { b.addEventListener("click", function () { go(n); }); })(k);
      dotsWrap.appendChild(b); dots.push(b);
    }
    function go(n) {
      idx = (n + total) % total;
      pimg.src = "assets/slides/slide-" + pad(idx + 1) + ".png";
      pimg.alt = "Folie " + (idx + 1) + " von " + total;
      if (pcur) pcur.textContent = pad(idx + 1);
      dots.forEach(function (d, i) { d.classList.toggle("is-on", i === idx); });
      // nächste Folie vorladen
      var nx = new Image(); nx.src = "assets/slides/slide-" + pad(((idx + 1) % total) + 1) + ".png";
    }
    pres.querySelectorAll(".pres-prev").forEach(function (b) { b.addEventListener("click", function () { go(idx - 1); }); });
    pres.querySelectorAll(".pres-next").forEach(function (b) { b.addEventListener("click", function () { go(idx + 1); }); });
    pimg.addEventListener("click", function (e) {
      var r = pimg.getBoundingClientRect();
      go((e.clientX - r.left) < r.width / 2 ? idx - 1 : idx + 1);
    });
    document.addEventListener("keydown", function (e) {
      // nicht beim Tippen in Suche/Formular blättern
      var t = e.target, tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (t && t.isContentEditable)) return;
      if (e.key === "ArrowLeft") go(idx - 1);
      else if (e.key === "ArrowRight") go(idx + 1);
    });
    go(0);
  }

  // Kontaktformular (Unterseiten) — clientseitiges Feedback, kein Backend
  var form = document.querySelector(".contact-form");
  if (form) {
    var ok = form.querySelector(".form-success");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var name = (form.querySelector('[name="name"]') || {}).value || "";
      if (ok) {
        ok.textContent = (name ? name.split(" ")[0] + ", v" : "V") +
          "ielen Dank! Ihre Nachricht ist eingegangen — wir melden uns in Kürze.";
        ok.classList.add("is-on");
      }
      form.reset();
    });
  }
})();
