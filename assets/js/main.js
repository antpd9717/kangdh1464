// 최소 기본 스크립트 - 주제/브랜드 확정 전 임시 골격
document.addEventListener("DOMContentLoaded", function () {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initArticleFilters();
});

// 지역 허브 페이지: 소지역/카테고리 필터
// - progressive enhancement: 이 스크립트가 실행되어야만 필터 UI가 보인다
//   (마크업에서 .article-filters는 기본 hidden — JS 없으면 전체 글 목록만 노출됨).
// - 글 <li>는 절대 DOM에서 제거하지 않고 hidden 속성으로만 감춘다 (SEO/크롤링 보존).
// - 소지역 필터와 카테고리 필터는 AND 조건으로 동시 적용된다.
function initArticleFilters() {
  var filterBars = document.querySelectorAll(".article-filters");

  filterBars.forEach(function (filterBar) {
    var section = filterBar.closest(".post-section") || filterBar.parentElement;
    if (!section) {
      return;
    }

    var items = section.querySelectorAll(".article-item");
    var subgroups = section.querySelectorAll(".article-subgroup");
    var emptyState = section.querySelector(".article-empty-state");

    var state = { subarea: "all", category: "all" };

    function applyFilters() {
      var anyVisible = false;

      items.forEach(function (item) {
        var matchesSubarea =
          state.subarea === "all" || item.getAttribute("data-subarea") === state.subarea;
        var matchesCategory =
          state.category === "all" || item.getAttribute("data-category") === state.category;
        var visible = matchesSubarea && matchesCategory;

        item.hidden = !visible;
        if (visible) {
          anyVisible = true;
        }
      });

      subgroups.forEach(function (group) {
        var hasVisibleItem = Array.prototype.some.call(
          group.querySelectorAll(".article-item"),
          function (item) {
            return !item.hidden;
          }
        );
        group.hidden = !hasVisibleItem;
      });

      if (emptyState) {
        emptyState.hidden = anyVisible;
      }
    }

    var pills = filterBar.querySelectorAll(".filter-pill");
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var type = pill.getAttribute("data-filter-type");
        var value = pill.getAttribute("data-filter-value");
        if (!type) {
          return;
        }
        state[type] = value;

        var row = pill.closest(".filter-row");
        var rowPills = row ? row.querySelectorAll(".filter-pill") : [pill];
        rowPills.forEach(function (rowPill) {
          var isActive = rowPill === pill;
          rowPill.classList.toggle("is-active", isActive);
          rowPill.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        applyFilters();
      });
    });

    // JS가 실행됐을 때만 필터 UI를 보여준다 (progressive enhancement).
    filterBar.hidden = false;
    applyFilters();
  });
}
