// 최소 기본 스크립트 - 주제/브랜드 확정 전 임시 골격
document.addEventListener("DOMContentLoaded", function () {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
