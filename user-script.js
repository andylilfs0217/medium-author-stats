// ==UserScript==
// @name         Medium Any Author Stats In-Page
// @namespace    https://github.com/andylilfs0217/medium-author-stats
// @version      1.0.0
// @description  Adds an in-page stats button to Medium author profiles and shows author post statistics.
// @author       andylilfs0217
// @license      MIT
// @match        https://medium.com/*
// @match        https://*.medium.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const GRAPHQL_URL = `${window.location.origin}/_/graphql`;
  const POSTS_PAGE_LIMIT = 25;
  const MAX_POSTS_CALLS = 100;
  const BUTTON_ID = "medium-author-stats-button";
  const MODAL_ID = "medium-author-stats-modal";
  const DEBUG_PREFIX = "[Medium Author Stats]";

  const USER_PROFILE_QUERY = `
    query UserProfileQuery(
      $id: ID,
      $username: ID,
      $homepagePostsLimit: PaginationLimit,
      $homepagePostsFrom: String = null,
      $includeDistributedResponses: Boolean = true
    ) {
      userResult(id: $id, username: $username) {
        __typename
        ... on User {
          id
          name
          username
          imageId
          mediumMemberAt
          socialStats {
            followerCount
            __typename
          }
          newsletterV3 {
            subscribersCount
            __typename
          }
          homepagePostsConnection(
            paging: {limit: $homepagePostsLimit, from: $homepagePostsFrom}
            includeDistributedResponses: $includeDistributedResponses
          ) {
            posts {
              id
              title
              mediumUrl
              clapCount
              voterCount
              repostCount
              readingTime
              visibility
              firstPublishedAt
              postResponses {
                count
                __typename
              }
              creator {
                id
                imageId
                name
                username
                mediumMemberAt
                socialStats {
                  followerCount
                  __typename
                }
                newsletterV3 {
                  subscribersCount
                  __typename
                }
                __typename
              }
              __typename
            }
            pagingInfo {
              next {
                from
                limit
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
      }
    }
  `;

  function installStyles() {
    if (document.getElementById("medium-author-stats-styles")) return;

    const style = document.createElement("style");
    style.id = "medium-author-stats-styles";
    style.textContent = `
      #${BUTTON_ID} {
        align-items: center !important;
        background: #ffffff !important;
        border: 1px solid #1a8917 !important;
        border-radius: 999px !important;
        box-sizing: border-box !important;
        color: #1a8917 !important;
        cursor: pointer !important;
        display: inline-flex !important;
        flex: 0 0 auto !important;
        font: 500 14px/20px sohne, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        height: 40px !important;
        justify-content: center !important;
        margin: 0 0 0 10px !important;
        min-width: 0 !important;
        padding: 0 16px !important;
        white-space: nowrap !important;
      }

      #${BUTTON_ID}:hover {
        background: #f1faf1 !important;
        border-color: #156d13 !important;
        color: #156d13 !important;
      }

      #${BUTTON_ID}[disabled] {
        cursor: progress !important;
        opacity: 0.7 !important;
      }

      .mas-action-row {
        align-items: center !important;
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
      }

      #${MODAL_ID} {
        background: rgba(25, 25, 25, 0.42);
        bottom: 0;
        box-sizing: border-box;
        display: none;
        left: 0;
        padding: 24px;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 2147483647;
      }

      #${MODAL_ID}.is-open {
        align-items: center;
        display: flex;
        justify-content: center;
      }

      .mas-panel {
        background: #fff;
        border: 1px solid #e6e6e6;
        border-radius: 8px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
        color: #191919;
        font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
        max-height: min(820px, calc(100vh - 48px));
        max-width: 980px;
        overflow: auto;
        width: min(980px, calc(100vw - 48px));
      }

      .mas-header {
        align-items: center;
        border-bottom: 1px solid #e6e6e6;
        display: flex;
        justify-content: space-between;
        padding: 18px 22px;
      }

      .mas-title {
        font-size: 20px;
        font-weight: 700;
        line-height: 26px;
        margin: 0;
      }

      .mas-close {
        align-items: center;
        background: transparent;
        border: 0;
        border-radius: 999px;
        color: #6b6b6b;
        cursor: pointer;
        display: inline-flex;
        font-size: 26px;
        height: 34px;
        justify-content: center;
        line-height: 34px;
        padding: 0;
        width: 34px;
      }

      .mas-close:hover {
        background: #f2f2f2;
        color: #191919;
      }

      .mas-body {
        padding: 22px;
      }

      .mas-status {
        color: #6b6b6b;
        font-size: 15px;
        line-height: 22px;
        margin: 0;
      }

      .mas-error {
        background: #fff7f7;
        border: 1px solid #ffd6d6;
        border-radius: 8px;
        color: #8a1f1f;
        font-size: 14px;
        line-height: 21px;
        padding: 14px 16px;
      }

      .mas-profile {
        align-items: center;
        display: flex;
        gap: 14px;
        margin-bottom: 22px;
      }

      .mas-avatar {
        border-radius: 999px;
        height: 64px;
        object-fit: cover;
        width: 64px;
      }

      .mas-name {
        font-size: 20px;
        font-weight: 700;
        line-height: 26px;
      }

      .mas-username {
        color: #6b6b6b;
        font-size: 14px;
        line-height: 21px;
      }

      .mas-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .mas-stat {
        border: 1px solid #e6e6e6;
        border-radius: 8px;
        padding: 13px 14px;
      }

      .mas-label {
        color: #6b6b6b;
        font-size: 12px;
        line-height: 18px;
        margin-bottom: 6px;
      }

      .mas-value {
        font-size: 20px;
        font-weight: 700;
        line-height: 26px;
      }

      .mas-subvalue {
        color: #6b6b6b;
        font-size: 12px;
        line-height: 18px;
        margin-top: 2px;
      }

      .mas-section-title {
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
        margin: 24px 0 10px;
      }

      .mas-table-wrap {
        border: 1px solid #e6e6e6;
        border-radius: 8px;
        overflow-x: auto;
      }

      .mas-table {
        border-collapse: collapse;
        font-size: 13px;
        line-height: 19px;
        min-width: 620px;
        width: 100%;
      }

      .mas-table th,
      .mas-table td {
        border-bottom: 1px solid #e6e6e6;
        padding: 10px 12px;
        text-align: right;
        vertical-align: top;
      }

      .mas-table th:first-child,
      .mas-table td:first-child {
        text-align: left;
      }

      .mas-table th {
        background: #fafafa;
        color: #6b6b6b;
        font-weight: 600;
      }

      .mas-table tr:last-child td {
        border-bottom: 0;
      }

      .mas-chart {
        border: 1px solid #e6e6e6;
        border-radius: 8px;
        min-height: 240px;
        overflow: hidden;
      }

      .mas-chart svg {
        display: block;
        height: auto;
        max-width: 100%;
        width: 100%;
      }

      .mas-chart-hit {
        cursor: pointer;
      }

      .mas-chart-hit .mas-chart-hover-line,
      .mas-chart-hit .mas-chart-hover-point,
      .mas-chart-hit .mas-chart-details-title,
      .mas-chart-hit .mas-chart-details-row {
        opacity: 0;
        pointer-events: none;
        transition: opacity 120ms ease;
      }

      .mas-chart-hit:hover .mas-chart-hover-line,
      .mas-chart-hit:focus .mas-chart-hover-line {
        opacity: 1;
      }

      .mas-chart-hit:hover .mas-chart-hover-point,
      .mas-chart-hit:focus .mas-chart-hover-point {
        opacity: 1;
      }

      .mas-chart-hit:hover .mas-chart-details-title,
      .mas-chart-hit:focus .mas-chart-details-title,
      .mas-chart-hit:hover .mas-chart-details-row,
      .mas-chart-hit:focus .mas-chart-details-row {
        opacity: 1;
      }

      .mas-chart-details-placeholder {
        fill: #6b6b6b;
        font: 500 13px/18px sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
        pointer-events: none;
        transition: opacity 120ms ease;
      }

      .mas-chart-hit:hover ~ .mas-chart-details-placeholder,
      .mas-chart-hit:focus ~ .mas-chart-details-placeholder {
        opacity: 0;
      }

      .mas-chart-details-title {
        fill: #191919;
        font: 600 14px/20px sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
      }

      .mas-chart-details-row {
        fill: #4f4f4f;
        font: 500 12px/18px sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
      }

      .mas-post-link {
        color: #191919;
        font-weight: 500;
        text-decoration: none;
      }

      .mas-post-link:hover {
        color: #1a8917;
        text-decoration: underline;
      }

      .mas-legend {
        align-items: center;
        color: #6b6b6b;
        display: flex;
        flex-wrap: wrap;
        font-size: 12px;
        gap: 14px;
        line-height: 18px;
        padding: 0 4px 10px;
      }

      .mas-swatch {
        border-radius: 999px;
        display: inline-block;
        height: 9px;
        margin-right: 6px;
        width: 9px;
      }

      @media (max-width: 760px) {
        #${MODAL_ID} {
          padding: 12px;
        }

        .mas-panel {
          max-height: calc(100vh - 24px);
          width: calc(100vw - 24px);
        }

        .mas-header,
        .mas-body {
          padding-left: 16px;
          padding-right: 16px;
        }

        .mas-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getUsername() {
    const feedHref = document.querySelector("link#feedLink")?.getAttribute("href");
    const feedMatch = feedHref?.match(/@([^/?#]+)\/?$/);
    if (feedMatch?.[1]) return feedMatch[1];

    const pathMatch = window.location.pathname.match(/^\/@([^/?#]+)/);
    if (pathMatch?.[1]) return pathMatch[1];

    const canonical = document.querySelector("link[rel='canonical']")?.getAttribute("href") || "";
    const canonicalMatch = canonical.match(/medium\.com\/@([^/?#]+)/);
    if (canonicalMatch?.[1]) return canonicalMatch[1];

    return null;
  }

  function isLikelyProfilePage() {
    if (getUsername()) return true;
    return Boolean(document.querySelector("link#feedLink"));
  }

  function findFollowButton() {
    const controls = Array.from(document.querySelectorAll("button, [role='button']"));
    return controls
      .filter((control) => {
        const text = normalizeText(control.textContent);
        const ariaLabel = normalizeText(control.getAttribute("aria-label"));
        return isFollowControlText(text) || isFollowControlText(ariaLabel);
      })
      .map((control) => ({ control, score: scoreFollowControl(control) }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.control || null;
  }

  function isFollowControlText(text) {
    return text === "Follow" || text === "Following";
  }

  function scoreFollowControl(control) {
    if (!isElementVisible(control)) return 0;

    let score = 10;
    const sidebar = closestAuthorSidebar(control);
    if (sidebar) score += 100;

    const rect = control.getBoundingClientRect();
    if (rect.left > window.innerWidth / 2) score += 20;
    if (rect.top >= 0 && rect.top < window.innerHeight) score += 10;

    return score;
  }

  function closestAuthorSidebar(control) {
    let node = control.parentElement;
    while (node && node !== document.body) {
      if (
        node.querySelector(".pw-author-name") &&
        node.querySelector(".pw-follower-count") &&
        node.querySelector("img")
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  function normalizeText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function findInsertionTarget(followButton) {
    if (closestAuthorSidebar(followButton)) {
      const wrapper = followButton.parentElement;
      const actionRow = wrapper?.parentElement;
      if (actionRow && normalizeText(actionRow.textContent).length < 80) {
        return actionRow;
      }
    }

    const parent = followButton.parentElement;
    if (!parent) return null;

    const parentText = normalizeText(parent.textContent);
    if (parent.children.length <= 4 && parentText.length < 80) {
      return parent;
    }

    return followButton;
  }

  function injectButton() {
    if (document.getElementById(BUTTON_ID)) return;

    const followButton = findFollowButton();
    if (!followButton) {
      if (!isLikelyProfilePage()) removeButton();
      return;
    }

    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.textContent = "Stats";
    copyFollowButtonShape(followButton, button);
    button.addEventListener("click", () => openStatsModal(button));

    const target = findInsertionTarget(followButton);
    if (!target) return;

    if (target === followButton) {
      followButton.insertAdjacentElement("afterend", button);
      followButton.parentElement?.classList.add("mas-action-row");
      setDebugStatus("inserted after follow button");
      return;
    }

    target.classList.add("mas-action-row");
    target.appendChild(button);
    setDebugStatus("inserted in follow button row");
  }

  function copyFollowButtonShape(followButton, statsButton) {
    const computed = window.getComputedStyle(followButton);
    const rect = followButton.getBoundingClientRect();
    const width = Math.round(rect.width);

    setImportantStyle(statsButton, "height", computed.height);
    setImportantStyle(statsButton, "border-radius", computed.borderRadius);
    setImportantStyle(statsButton, "font", computed.font);
    setImportantStyle(statsButton, "font-size", computed.fontSize);
    setImportantStyle(statsButton, "font-weight", computed.fontWeight);
    setImportantStyle(statsButton, "line-height", computed.lineHeight);
    setImportantStyle(statsButton, "padding", computed.padding);
    setImportantStyle(statsButton, "min-height", computed.minHeight);

    setImportantStyle(statsButton, "width", `${width}px`);

    if (width >= 120) {
      setImportantStyle(statsButton, "margin-left", "0");
      setImportantStyle(statsButton, "margin-top", "12px");
    } else {
      setImportantStyle(statsButton, "margin-left", "10px");
    }
  }

  function setImportantStyle(element, property, value) {
    if (value) element.style.setProperty(property, value, "important");
  }

  function removeButton() {
    document.getElementById(BUTTON_ID)?.remove();
  }

  function createModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.innerHTML = `
      <section class="mas-panel" role="dialog" aria-modal="true" aria-labelledby="mas-title">
        <header class="mas-header">
          <h2 class="mas-title" id="mas-title">Medium author stats</h2>
          <button class="mas-close" type="button" aria-label="Close">x</button>
        </header>
        <div class="mas-body">
          <p class="mas-status">Ready.</p>
        </div>
      </section>
    `;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    modal.querySelector(".mas-close").addEventListener("click", closeModal);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });

    document.body.appendChild(modal);
    return modal;
  }

  async function openStatsModal(sourceButton) {
    const username = getUsername();
    const modal = createModal();
    modal.classList.add("is-open");

    if (!username) {
      renderError("Could not determine the Medium username for this page.");
      return;
    }

    sourceButton.disabled = true;
    setModalStatus(`Loading @${username} posts...`);

    try {
      const posts = await getAllPosts(username, (count) => {
        setModalStatus(`Loaded ${formatNumber(count)} posts...`);
      });

      if (!posts.length) {
        renderError(`No posts were returned for @${username}.`);
        return;
      }

      renderAuthorStats(mapPostsToAuthor(posts));
    } catch (error) {
      renderError(error instanceof Error ? error.message : String(error));
    } finally {
      sourceButton.disabled = false;
    }
  }

  function closeModal() {
    document.getElementById(MODAL_ID)?.classList.remove("is-open");
  }

  function setModalStatus(text) {
    createModal().querySelector(".mas-body").innerHTML = `<p class="mas-status">${escapeHtml(text)}</p>`;
  }

  function renderError(message) {
    createModal().querySelector(".mas-body").innerHTML = `
      <div class="mas-error">
        <strong>Unable to load stats.</strong><br>
        ${escapeHtml(message)}
      </div>
    `;
  }

  async function getAllPosts(username, onProgress) {
    let startFromPost = null;
    let calls = 0;
    let posts = [];

    do {
      calls += 1;
      const page = await getPostsPage(username, startFromPost);
      const pagePosts = page?.posts || [];
      posts = posts.concat(pagePosts);
      onProgress(posts.length);
      startFromPost = page?.pagingInfo?.next?.from || null;
    } while (startFromPost && calls < MAX_POSTS_CALLS);

    return posts;
  }

  async function getPostsPage(username, startFromPost) {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          operationName: "UserProfileQuery",
          variables: {
            homepagePostsFrom: startFromPost,
            homepagePostsLimit: POSTS_PAGE_LIMIT,
            includeDistributedResponses: true,
            username,
          },
          query: USER_PROFILE_QUERY,
        },
      ]),
    });

    if (!response.ok) {
      throw new Error(`Medium returned HTTP ${response.status}.`);
    }

    const payload = await response.json();
    const first = Array.isArray(payload) ? payload[0] : payload;

    if (first?.errors?.length) {
      throw new Error(first.errors.map((item) => item.message).join(" "));
    }

    const result = first?.data?.userResult;
    if (!result || result.__typename !== "User") {
      throw new Error("Medium did not return a user profile for this page.");
    }

    return result.homepagePostsConnection;
  }

  function mapPostsToAuthor(posts) {
    const firstCreator = posts.find((post) => post.creator)?.creator || {};
    const authorPosts = posts.slice().reverse().map((post) => ({
      id: post.id || "",
      title: post.title || "Untitled",
      url: getPostUrl(post),
      claps: toNumber(post.clapCount),
      clappers: toNumber(post.voterCount),
      responses: toNumber(post.postResponses?.count),
      reposts: toNumber(post.repostCount),
      readingTime: toNumber(post.readingTime),
      visibility: post.visibility || "",
      publishedAt: toNumber(post.firstPublishedAt),
    }));

    const totals = posts.reduce(
      (memo, post) => {
        memo.claps += toNumber(post.clapCount);
        memo.responses += toNumber(post.postResponses?.count);
        memo.clappers += toNumber(post.voterCount);
        memo.reposts += toNumber(post.repostCount);
        memo.readingTime += toNumber(post.readingTime);
        memo.locked += post.visibility === "LOCKED" ? 1 : 0;
        return memo;
      },
      { claps: 0, responses: 0, clappers: 0, reposts: 0, readingTime: 0, locked: 0 },
    );

    const followers = toNumber(firstCreator.socialStats?.followerCount);

    return {
      id: firstCreator.id || "",
      imageUrl: firstCreator.imageId ? `https://miro.medium.com/fit/c/176/176/${firstCreator.imageId}` : "",
      name: firstCreator.name || "Medium author",
      username: firstCreator.username || getUsername() || "",
      newsletterSubscribers: toNumber(firstCreator.newsletterV3?.subscribersCount),
      memberSince: toNumber(firstCreator.mediumMemberAt),
      followers,
      totals,
      posts: authorPosts,
      clapsPerPost: roundToTwo(totals.claps / authorPosts.length),
      clapsPerFollower: roundToTwo(safeDivide(totals.claps, followers)),
      responsesPerPost: roundToTwo(totals.responses / authorPosts.length),
      responsesPerFollower: roundToTwo(safeDivide(totals.responses, followers)),
      clappersPerPost: roundToTwo(totals.clappers / authorPosts.length),
      clappersPerFollower: roundToTwo(safeDivide(totals.clappers, followers)),
      repostsPerPost: roundToTwo(totals.reposts / authorPosts.length),
      repostsPerFollower: roundToTwo(safeDivide(totals.reposts, followers)),
    };
  }

  function renderAuthorStats(author) {
    const topPosts = author.posts
      .slice()
      .sort((a, b) => b.claps - a.claps)
      .slice(0, 8);

    createModal().querySelector(".mas-body").innerHTML = `
      <div class="mas-profile">
        ${author.imageUrl ? `<img class="mas-avatar" src="${escapeAttribute(author.imageUrl)}" alt="">` : ""}
        <div>
          <div class="mas-name">${escapeHtml(author.name)}</div>
          <div class="mas-username">@${escapeHtml(author.username)}</div>
        </div>
      </div>

      <div class="mas-grid">
        ${statCard("Followers", formatNumber(author.followers))}
        ${statCard("Posts", formatNumber(author.posts.length), `${formatNumber(author.totals.locked)} locked`)}
        ${statCard("Newsletter", formatNumber(author.newsletterSubscribers), "subscribers")}
        ${statCard("Member since", author.memberSince ? formatDate(author.memberSince) : "Not a member")}
        ${statCard("Total claps", formatNumber(author.totals.claps), `${formatNumber(author.clapsPerPost)} per post`)}
        ${statCard("Responses", formatNumber(author.totals.responses), `${formatNumber(author.responsesPerPost)} per post`)}
        ${statCard("Clappers", formatNumber(author.totals.clappers), `${formatNumber(author.clappersPerPost)} per post`)}
        ${statCard("Reposts", formatNumber(author.totals.reposts), `${formatNumber(author.repostsPerPost)} per post`)}
        ${statCard("Reading time", formatNumber(Math.round(author.totals.readingTime)), "total minutes")}
      </div>

      <h3 class="mas-section-title">Engagement ratios</h3>
      <div class="mas-table-wrap">
        <table class="mas-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Total</th>
              <th>Per post</th>
              <th>Per follower</th>
            </tr>
          </thead>
          <tbody>
            ${ratioRow("Claps", author.totals.claps, author.clapsPerPost, author.clapsPerFollower)}
            ${ratioRow("Responses", author.totals.responses, author.responsesPerPost, author.responsesPerFollower)}
            ${ratioRow("Clappers", author.totals.clappers, author.clappersPerPost, author.clappersPerFollower)}
            ${ratioRow("Reposts", author.totals.reposts, author.repostsPerPost, author.repostsPerFollower)}
          </tbody>
        </table>
      </div>

      <h3 class="mas-section-title">Posts in publishing order</h3>
      <div class="mas-legend">
        <span><span class="mas-swatch" style="background:#1a8917"></span>Claps</span>
        <span><span class="mas-swatch" style="background:#1565c0"></span>Responses</span>
        <span><span class="mas-swatch" style="background:#b45309"></span>Clappers</span>
        <span><span class="mas-swatch" style="background:#7c3aed"></span>Reposts</span>
      </div>
      <div class="mas-chart">${renderChart(author.posts)}</div>

      <h3 class="mas-section-title">Top posts by claps</h3>
      <div class="mas-table-wrap">
        <table class="mas-table">
          <thead>
            <tr>
              <th>Post</th>
              <th>Published</th>
              <th>Claps</th>
              <th>Responses</th>
              <th>Clappers</th>
              <th>Reposts</th>
            </tr>
          </thead>
          <tbody>
            ${topPosts.map(postRow).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function statCard(label, value, subvalue = "") {
    return `
      <div class="mas-stat">
        <div class="mas-label">${escapeHtml(label)}</div>
        <div class="mas-value">${escapeHtml(value)}</div>
        ${subvalue ? `<div class="mas-subvalue">${escapeHtml(subvalue)}</div>` : ""}
      </div>
    `;
  }

  function ratioRow(label, total, perPost, perFollower) {
    return `
      <tr>
        <td>${escapeHtml(label)}</td>
        <td>${formatNumber(total)}</td>
        <td>${formatNumber(perPost)}</td>
        <td>${formatNumber(perFollower)}</td>
      </tr>
    `;
  }

  function postRow(post) {
    return `
      <tr>
        <td>
          <a class="mas-post-link" href="${escapeAttribute(post.url)}">${escapeHtml(post.title)}</a>
        </td>
        <td>${post.publishedAt ? formatDate(post.publishedAt) : "-"}</td>
        <td>${formatNumber(post.claps)}</td>
        <td>${formatNumber(post.responses)}</td>
        <td>${formatNumber(post.clappers)}</td>
        <td>${formatNumber(post.reposts)}</td>
      </tr>
    `;
  }

  function renderChart(posts) {
    if (posts.length < 2) {
      return `<p class="mas-status" style="padding:16px">At least two posts are needed for a trend chart.</p>`;
    }

    const width = 920;
    const height = 390;
    const padding = { top: 24, right: 22, bottom: 148, left: 58 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const axisY = height - padding.bottom;
    const tickLabelY = axisY + 22;
    const axisLabelY = axisY + 49;
    const detailsTitleY = axisY + 84;
    const detailsRowY = axisY + 108;
    const detailsPlaceholderY = axisY + 96;
    const maxValue = Math.max(
      1,
      ...posts.flatMap((post) => [post.claps, post.responses, post.clappers, post.reposts]),
    );

    const scaleX = (index) => padding.left + (index / Math.max(1, posts.length - 1)) * plotWidth;
    const scaleY = (value) => padding.top + plotHeight - (value / maxValue) * plotHeight;
    const series = [
      { key: "claps", color: "#1a8917" },
      { key: "responses", color: "#1565c0" },
      { key: "clappers", color: "#b45309" },
      { key: "reposts", color: "#7c3aed" },
    ];
    const gridLines = [0, 0.25, 0.5, 0.75, 1]
      .map((ratio) => {
        const y = padding.top + plotHeight - ratio * plotHeight;
        const label = Math.round(maxValue * ratio);
        return `
          <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#eeeeee"></line>
          <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" fill="#6b6b6b" font-size="11">${label}</text>
        `;
      })
      .join("");
    const lines = series
      .map((item) => {
        const points = posts.map((post, index) => `${scaleX(index)},${scaleY(post[item.key])}`).join(" ");
        return `<polyline points="${points}" fill="none" stroke="${item.color}" stroke-width="2.5" stroke-linejoin="round"></polyline>`;
      })
      .join("");
    const hitWidth = Math.max(12, plotWidth / Math.max(1, posts.length - 1));
    const hoverTargets = posts
      .map((post, index) => {
        const x = scaleX(index);
        const title = `${post.title}
Claps: ${formatNumber(post.claps)}
Responses: ${formatNumber(post.responses)}
Clappers: ${formatNumber(post.clappers)}
Reposts: ${formatNumber(post.reposts)}
Click to open post`;
        const detailStats = `Claps: ${formatNumber(post.claps)} | Responses: ${formatNumber(post.responses)} | Clappers: ${formatNumber(post.clappers)} | Reposts: ${formatNumber(post.reposts)}`;

        return `
          <a class="mas-chart-hit" href="${escapeAttribute(post.url)}" aria-label="${escapeAttribute(title)}">
            <rect
              x="${x - hitWidth / 2}"
              y="${padding.top}"
              width="${hitWidth}"
              height="${plotHeight}"
              fill="transparent"
              pointer-events="all"
            ></rect>
            <line
              class="mas-chart-hover-line"
              x1="${x}"
              y1="${padding.top}"
              x2="${x}"
              y2="${axisY}"
              stroke="#9ca3af"
              stroke-dasharray="4 4"
            ></line>
            <circle class="mas-chart-hover-point" cx="${x}" cy="${scaleY(post.claps)}" r="5" fill="#1a8917"></circle>
            <circle class="mas-chart-hover-point" cx="${x}" cy="${scaleY(post.responses)}" r="5" fill="#1565c0"></circle>
            <circle class="mas-chart-hover-point" cx="${x}" cy="${scaleY(post.clappers)}" r="5" fill="#b45309"></circle>
            <circle class="mas-chart-hover-point" cx="${x}" cy="${scaleY(post.reposts)}" r="5" fill="#7c3aed"></circle>
            <text class="mas-chart-details-title" x="${width / 2}" y="${detailsTitleY}" text-anchor="middle">${escapeHtml(post.title)}</text>
            <text class="mas-chart-details-row" x="${width / 2}" y="${detailsRowY}" text-anchor="middle">${escapeHtml(detailStats)}</text>
          </a>
        `;
      })
      .join("");
    const ticks = posts
      .map((_, index) => {
        if (posts.length > 14 && index % Math.ceil(posts.length / 10) !== 0 && index !== posts.length - 1) {
          return "";
        }
        const x = scaleX(index);
        return `
          <line x1="${x}" y1="${axisY}" x2="${x}" y2="${axisY + 5}" stroke="#bdbdbd"></line>
          <text x="${x}" y="${tickLabelY}" text-anchor="middle" fill="#6b6b6b" font-size="11">${index + 1}</text>
        `;
      })
      .join("");

    return `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Post engagement trend chart">
        <rect width="${width}" height="${height}" fill="#fff"></rect>
        ${gridLines}
        <line x1="${padding.left}" y1="${axisY}" x2="${width - padding.right}" y2="${axisY}" stroke="#bdbdbd"></line>
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${axisY}" stroke="#bdbdbd"></line>
        ${lines}
        ${ticks}
        <text x="${width / 2}" y="${axisLabelY}" text-anchor="middle" fill="#6b6b6b" font-size="12">Posts in publishing order</text>
        ${hoverTargets}
        <text class="mas-chart-details-placeholder" x="${width / 2}" y="${detailsPlaceholderY}" text-anchor="middle">Hover over a post in the graph to see its title and engagement stats.</text>
      </svg>
    `;
  }

  function getPostUrl(post) {
    if (post.mediumUrl) return new URL(post.mediumUrl, window.location.origin).href;
    if (post.id) return `${window.location.origin}/p/${encodeURIComponent(post.id)}`;
    return window.location.href;
  }

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function safeDivide(numerator, denominator) {
    return denominator ? numerator / denominator : 0;
  }

  function roundToTwo(value) {
    return Math.round((Number.isFinite(value) ? value : 0) * 100 + Number.EPSILON) / 100;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(toNumber(value));
  }

  function formatDate(timestamp) {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(timestamp));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function boot() {
    installStyles();
    setDebugStatus("booted");
    injectButton();

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(injectButton);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    let lastUrl = window.location.href;
    window.setInterval(() => {
      if (lastUrl === window.location.href) return;
      lastUrl = window.location.href;
      removeButton();
      window.setTimeout(injectButton, 400);
    }, 700);
  }

  function setDebugStatus(message) {
    window.__mediumAuthorStatsStatus = {
      message,
      version: "0.1.15",
      url: window.location.href,
      at: new Date().toISOString(),
      followButtons: Array.from(document.querySelectorAll("button, [role='button']"))
        .filter((control) => isFollowControlText(normalizeText(control.textContent)))
        .map((control) => ({
          text: normalizeText(control.textContent),
          visible: isElementVisible(control),
          score: scoreFollowControl(control),
          rect: rectSummary(control),
        })),
    };
    console.debug(DEBUG_PREFIX, window.__mediumAuthorStatsStatus);
  }

  function rectSummary(element) {
    const rect = element.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  }

  boot();
})();
