// ==UserScript==
// @name         ジャンプ系サイト履歴全部表示
// @namespace    osa-p.net
// @author       osa <osa@osa-p.net>
// @version      1.0.1
// @homepageURL  https://github.com/osapon/j_manga_history_view
// @match        https://tonarinoyj.jp/history
// @match        https://shonenjumpplus.com/history
// @match        https://comic-ogyaaa.com/history
// @match        https://www.sunday-webry.com/history
// @match        https://comic-days.com/my/history
// @updateURL    https://github.com/osapon/j_manga_history_view/raw/master/j_manga_history_view.meta.js
// @downloadURL  https://github.com/osapon/j_manga_history_view/raw/master/j_manga_history_view.user.js
// ==/UserScript==
(function() {
  let hm = localStorage.getItem('history_manager');
  if (!hm) return;
  hm = JSON.parse(hm);
  hm = hm.sort(function(a, b) {
    return (a.createdAt > b.createdAt) ? -1 : 1;
  });
  document.querySelector('.history-list-title .history-list-description-mini').innerHTML = '最大50件';
  let morebtn = document.querySelector('ul.history-list > li.more-button-container');
  morebtn.style.display = 'none';
  //console.log(hm);
  hm.some((info, idx) => {
    if (idx < 10) return false;
    morebtn.parentNode.insertAdjacentHTML('beforeend', `<li><a href="${info.episode.permaLink}"><div class="thmb-container"><img src="${info.series.thumbnailUrl}" alt="${info.series.title}"></div><div class="link-container"><div class="title-box"><p class="series-title">${info.series.title}</p><p class="episode-title">${info.episode.title}</p></div></div></a></li>`);
    if (idx < 20) return false;
    fetch(`${location.protocol}//${location.host}/atom/series/${info.series.id}`, {
      "headers": {
        "content-type": "application/atom+xml; charset=utf-8"
      }
    })
    .then((response) => response.text())
    .then((restext) => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(restext, "application/xml");
      let hist_dt = new Date(info.episode.createAt);
      let feed_dt = new Date(dom.documentElement.querySelector("updated").textContent);
      if (hist_dt >= feed_dt) return;
      console.log(info, hist_dt, feed_dt, dom.documentElement);
		  let morebtn = document.querySelector('.update-notification-list > li.more-button-container');
      let entry = dom.documentElement.querySelector("entry");
      morebtn.parentNode.insertAdjacentHTML('beforeend', `<li><a href="${entry.querySelector("link").attributes['href'].textContent}"><div class="thmb-container"><img src="${info.series.thumbnailUrl}" alt="${entry.querySelector("content").textContent}"></div><div class="link-container"><div class="title-box"><p class="episode-date">${feed_dt.toLocaleDateString("ja-JP", {"year":"numeric","month":"2-digit","day":"2-digit"})}</p><p class="series-title">${info.series.title}</p><p class="episode-title">${entry.querySelector("title").textContent}</p></div></div></a></li>`);
  	});
  });
})();
