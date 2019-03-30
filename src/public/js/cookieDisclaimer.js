/* global $, localStorage */
"use strict";

if (localStorage.getItem('cookies') === 'enabled') {
  $("#consentBanner").hide();
}

function acceptCookies() {
  $("#consentBanner").hide();
  localStorage.setItem('cookies', 'enabled');
}
