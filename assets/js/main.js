// 최소 기본 스크립트 - 주제/브랜드 확정 전 임시 골격
document.addEventListener("DOMContentLoaded", function () {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initArticleFilters();
  initBackButton();
  initSpotMapLinks();
  initSpotCategoryBadges();
  initViewTabs();
  initRouteMapLinks();
});

// 스팟 카드 하나를 구글맵이 실제로 찾을 수 있는 검색어로 바꾼다.
// - "(정확한 상호명 확인 필요)" 같은 확인-필요 표시는 검색어에서 제외.
// - "스팟명 + 소지역명 + 지역 도시명 + 일본" 조합은 spot-map-link와 동일.
function buildSpotMapQuery(card, regionCity) {
  var nameEl = card.querySelector(".spot-name");
  if (!nameEl) {
    return "";
  }
  var name = nameEl.textContent.replace(/\s*\([^)]*확인[^)]*\)/g, "").trim();
  var subarea = card.getAttribute("data-subarea") || "";
  var queryParts = [name, subarea, regionCity, "일본"].filter(function (part) {
    return part;
  });
  return queryParts.join(" ");
}

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

    var query = buildSpotMapQuery(card, regionCity);
    if (!query) {
      return;
    }
    var mapUrl =
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);

    var link = document.createElement("a");
    link.className = "spot-map-link";
    link.href = mapUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "📍 지도에서 보기";
    card.appendChild(link);
  });
}

// 지역 허브 페이지: 소지역/카테고리/음식 종류 필터
// - progressive enhancement: 이 스크립트가 실행되어야만 필터 UI가 보인다
//   (마크업에서 .article-filters는 기본 hidden — JS 없으면 전체 글 목록만 노출됨).
// - 글 <li>는 절대 DOM에서 제거하지 않고 hidden 속성으로만 감춘다 (SEO/크롤링 보존).
// - 소지역/카테고리/음식 종류 필터는 AND 조건으로 동시 적용된다.
// - 음식 종류 필터는 "카테고리 = 먹을 것"일 때만 의미가 있다: 그 외에는
//   (a) 필터 결과에 아예 영향을 주지 않도록 우회하고, (b) UI 줄도 감춘다.
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
    var foodtypeRow = filterBar.querySelector(".filter-row-foodtype");

    var state = { subarea: "all", category: "all", foodtype: "all" };

    function updateFoodtypeRowVisibility() {
      if (foodtypeRow) {
        foodtypeRow.hidden = state.category !== "먹을것";
      }
    }

    function applyFilters() {
      var anyVisible = false;

      items.forEach(function (item) {
        var matchesSubarea =
          state.subarea === "all" || item.getAttribute("data-subarea") === state.subarea;
        var matchesCategory =
          state.category === "all" || item.getAttribute("data-category") === state.category;
        // 카테고리가 "먹을 것"이 아니면 음식 종류 필터는 결과에 영향을 주지 않는다.
        var matchesFoodtype =
          state.category !== "먹을것" ||
          state.foodtype === "all" ||
          item.getAttribute("data-foodtype") === state.foodtype;
        var visible = matchesSubarea && matchesCategory && matchesFoodtype;

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

        if (type === "category") {
          updateFoodtypeRowVisibility();
        }

        applyFilters();
      });
    });

    // JS가 실행됐을 때만 필터 UI를 보여준다 (progressive enhancement).
    filterBar.hidden = false;
    updateFoodtypeRowVisibility();
    applyFilters();
  });
}

// 지역 허브 페이지: 스팟 카드에 할것(🗺️)/먹을것(🍽️) 구분 아이콘 추가
// - "전체 동선 보기" 탭에서 소지역별로 할것/먹을것이 섞여 나열될 때
//   카테고리를 구분할 수 있도록 카드마다 작은 아이콘을 붙인다.
// - 평소(필터로 보기)에는 CSS로 감춰지고, .is-route-view일 때만 노출된다.
function initSpotCategoryBadges() {
  var cards = document.querySelectorAll(".spot-card");
  cards.forEach(function (card) {
    if (card.querySelector(".spot-category-badge")) {
      return;
    }

    var category = card.getAttribute("data-category");
    var nameEl = card.querySelector(".spot-name");
    if (!category || !nameEl) {
      return;
    }

    var badge = document.createElement("p");
    badge.className = "spot-category-badge";
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = category === "먹을것" ? "🍽️" : "🗺️";
    card.insertBefore(badge, nameEl);
  });
}

// 지역 허브 페이지: "필터로 보기" / "전체 동선 보기" 탭
// - progressive enhancement: JS 없으면 .view-tabs는 hidden으로 감춰지고,
//   필터도 적용되지 않은 전체 스팟 목록이 그대로 노출된다.
// - "전체 동선 보기"는 실제 도보 거리·소요 시간·방문 순서를 계산하지 않는다.
//   단순히 문서에 나열된 소지역 순서 그대로, 그 소지역의 할것/먹을것 스팟을
//   모두 한데 모아 보여주는 것뿐이다(현재 필터 선택 상태와 무관하게 전체 노출).
function initViewTabs() {
  var tabBars = document.querySelectorAll(".view-tabs");

  tabBars.forEach(function (tabBar) {
    var section = tabBar.closest(".post-section");
    if (!section) {
      return;
    }

    var tabs = tabBar.querySelectorAll(".view-tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var view = tab.getAttribute("data-view");

        tabs.forEach(function (t) {
          var isActive = t === tab;
          t.classList.toggle("is-active", isActive);
          t.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        section.classList.toggle("is-route-view", view === "route");
      });
    });

    // JS가 실행됐을 때만 탭 UI를 보여준다 (progressive enhancement).
    tabBar.hidden = false;
  });
}

// 지역 허브 페이지: "전체 동선 보기" 탭의 소지역 그룹마다 구글맵 길찾기
// (Directions) 링크를 추가한다.
// - 저희는 정확한 좌표·거리·소요 시간을 모른다. 대신 각 스팟을 개별 지도
//   검색 링크(spot-map-link)와 동일한 방식("스팟명 + 소지역 + 지역 도시명 +
//   일본")으로 만든 문자열을 구글맵 길찾기 URL의 origin/destination/waypoints에
//   그대로 넘겨, 구글이 실제 지명을 찾아 계산한 실제 도보 경로를 그대로 연다.
//   거리·시간·방문 순서를 저희가 직접 계산하거나 지어내지 않는다.
// - 소지역에 스팟이 1개뿐이면 출발지=도착지가 되어 경로가 성립하지 않으므로
//   버튼을 만들지 않는다(2개 이상인 소지역에만 표시).
// - 경유지가 지나치게 많으면 구글맵 길찾기 링크가 제대로 동작하지 않을 수
//   있어, 한 소지역당 최대 9개 스팟(문서에 나열된 순서 기준 처음 9개)까지만
//   경로에 포함한다.
var ROUTE_MAX_STOPS = 9;

function initRouteMapLinks() {
  var subgroups = document.querySelectorAll(".article-subgroup");
  if (!subgroups.length) {
    return;
  }

  var regionCity = document.body.getAttribute("data-map-region") || "";

  subgroups.forEach(function (subgroup) {
    if (subgroup.querySelector(".route-map-link")) {
      return;
    }

    var title = subgroup.querySelector(".article-subgroup-title");
    if (!title) {
      return;
    }

    var cards = subgroup.querySelectorAll(".spot-card");
    if (cards.length < 2) {
      return;
    }

    var stops = Array.prototype.slice.call(cards, 0, ROUTE_MAX_STOPS);
    var queries = stops
      .map(function (card) {
        return buildSpotMapQuery(card, regionCity);
      })
      .filter(function (query) {
        return query;
      });

    if (queries.length < 2) {
      return;
    }

    var origin = queries[0];
    var destination = queries[queries.length - 1];
    var waypoints = queries.slice(1, -1);

    var routeUrl =
      "https://www.google.com/maps/dir/?api=1" +
      "&origin=" + encodeURIComponent(origin) +
      "&destination=" + encodeURIComponent(destination) +
      (waypoints.length
        ? "&waypoints=" + waypoints.map(encodeURIComponent).join("|")
        : "") +
      "&travelmode=walking";

    var link = document.createElement("a");
    link.className = "route-map-link";
    link.href = routeUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "🗺️ 이 구역 전체 동선을 지도에서 보기";
    title.insertAdjacentElement("afterend", link);
  });
}
