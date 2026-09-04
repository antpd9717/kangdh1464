// 최소 기본 스크립트 - 주제/브랜드 확정 전 임시 골격
document.addEventListener("DOMContentLoaded", function () {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initArticleFilters();
  initBackButton();
  initSpotMapLinks();
});

// 상단 "뒤로가기" 버튼 (지역 허브/글/about·contact·privacy 페이지 공통)
// - 마크업의 href는 JS 없이도 동작하는 폴백 링크다(지역 허브는 홈으로,
//   글 페이지는 소속 지역 허브로 이동).
// - JS가 있고 브라우저 히스토리가 있으면(history.length > 1) 폴백이 아니라
//   실제로 사용자가 들어온 이전 페이지로 돌아간다(홈에서 왔든 다른 지역에서
//   왔든 자연스럽게 원래 위치로 복귀).
// - 새 탭으로 바로 열려 히스토리가 없는 경우엔 preventDefault를 하지 않고
//   href의 폴백 경로로 이동한다.
function initBackButton() {
  var buttons = document.querySelectorAll(".back-button");
  buttons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
      }
    });
  });
}

// 지역 허브 페이지: 스팟 카드에 구글맵 검색 링크 추가
// - 정확한 좌표/place ID를 지어내지 않고, "스팟명 + 소지역명 + 지역 도시명 + 일본"
//   문자열로 구글맵 검색 결과 URL을 만들어 새 탭에서 연다.
// - <body data-map-region="..."> 값(페이지의 대표 지역/도시명)과 각
//   .spot-card의 기존 data-subarea(필터에도 쓰이는 소지역명)를 조합해
//   동명 매장·동명 지명 혼동을 줄인다.
function initSpotMapLinks() {
  var cards = document.querySelectorAll(".spot-card");
  if (!cards.length) {
    return;
  }

  var regionCity = document.body.getAttribute("data-map-region") || "";

  cards.forEach(function (card) {
    if (card.querySelector(".spot-map-link")) {
      return;
    }

    var nameEl = card.querySelector(".spot-name");
    if (!nameEl) {
      return;
    }

    // "(정확한 상호명 확인 필요)" 같은 확인-필요 표시는 검색어에서 제외
    var name = nameEl.textContent.replace(/\s*\([^)]*확인[^)]*\)/g, "").trim();
    var subarea = card.getAttribute("data-subarea") || "";
    var queryParts = [name, subarea, regionCity, "일본"].filter(function (part) {
      return part;
    });
    var mapUrl =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(queryParts.join(" "));

    var link = document.createElement("a");
    link.className = "spot-map-link";
    link.href = mapUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "📍 지도에서 보기";
    card.appendChild(link);
  });
}

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
