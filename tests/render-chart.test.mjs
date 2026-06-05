import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadRenderChart() {
  const source = fs.readFileSync(new URL("../user-script.js", import.meta.url), "utf8");
  const instrumented = source.replace(
    /\n  boot\(\);\n\}\)\(\);\s*$/,
    "\n  window.__mediumAuthorStatsTest = { mapPostsToAuthor, renderChart };\n})();",
  );
  const window = {
    location: {
      href: "https://medium.com/@author",
      origin: "https://medium.com",
      pathname: "/@author",
    },
  };
  const context = {
    console,
    document: {},
    Intl,
    Math,
    MutationObserver: function MutationObserver() {},
    Number,
    String,
    URL,
    window,
  };

  vm.runInNewContext(instrumented, context);
  return window.__mediumAuthorStatsTest;
}

test("renderChart places hover details below x-axis label without plot tooltip card", () => {
  const { renderChart } = loadRenderChart();
  const html = renderChart([
    {
      title: "First post",
      url: "https://medium.com/p/first",
      claps: 1200,
      responses: 34,
      clappers: 56,
      reposts: 7,
    },
    {
      title: "Second post",
      url: "https://medium.com/p/second",
      claps: 2400,
      responses: 12,
      clappers: 80,
      reposts: 3,
    },
  ]);

  assert.equal(html.includes("mas-chart-tooltip-card"), false);
  assert.equal(html.includes("<foreignObject"), false);
  assert.match(html, /<text class="mas-chart-details-title"[^>]*y="326"[^>]*>First post<\/text>/);
  assert.match(
    html,
    /<text class="mas-chart-details-row"[^>]*y="350"[^>]*>Claps: 1,200 \| Responses: 34 \| Clappers: 56 \| Reposts: 7<\/text>/,
  );
  assert.match(
    html,
    /<text class="mas-chart-details-placeholder"[^>]*y="338"[^>]*>Hover over a post in the graph to see its title and engagement stats\.<\/text>/,
  );
  assert.ok(
    html.indexOf('y="264"') < html.indexOf('y="291"') &&
      html.indexOf('y="291"') < html.indexOf('y="326"'),
    "expected visible order: tick numbers, x-axis label, hover details",
  );
  assert.match(html, /<a class="mas-chart-hit" href="https:\/\/medium\.com\/p\/first"/);
});

test("mapPostsToAuthor includes Medium repost counts in totals and ratios", () => {
  const { mapPostsToAuthor } = loadRenderChart();

  const author = mapPostsToAuthor([
    {
      id: "newer",
      title: "Newer post",
      mediumUrl: "https://medium.com/p/newer",
      clapCount: 100,
      voterCount: 20,
      repostCount: 8,
      readingTime: 4,
      visibility: "PUBLIC",
      firstPublishedAt: 1780000000000,
      postResponses: { count: 6 },
      creator: {
        id: "author",
        name: "Author",
        username: "author",
        mediumMemberAt: 1700000000000,
        socialStats: { followerCount: 200 },
        newsletterV3: { subscribersCount: 30 },
      },
    },
    {
      id: "older",
      title: "Older post",
      mediumUrl: "https://medium.com/p/older",
      clapCount: 50,
      voterCount: 10,
      repostCount: 4,
      readingTime: 2,
      visibility: "PUBLIC",
      firstPublishedAt: 1770000000000,
      postResponses: { count: 2 },
      creator: {
        id: "author",
        name: "Author",
        username: "author",
        socialStats: { followerCount: 200 },
      },
    },
  ]);

  assert.equal(author.totals.reposts, 12);
  assert.equal(author.repostsPerPost, 6);
  assert.equal(author.repostsPerFollower, 0.06);
  assert.equal(author.posts[0].reposts, 4);
});

test("userscript version and GraphQL query are current", () => {
  const source = fs.readFileSync(new URL("../user-script.js", import.meta.url), "utf8");

  assert.match(source, /@version\s+0\.1\.15/);
  assert.match(source, /version: "0\.1\.15"/);
  assert.match(source, /\brepostCount\b/);
});

test("userscript metadata includes fields required by Greasy Fork", () => {
  const source = fs.readFileSync(new URL("../user-script.js", import.meta.url), "utf8");
  const metadata = source.slice(0, source.indexOf("// ==/UserScript==") + "// ==/UserScript==".length);

  assert.match(metadata, /^\/\/ ==UserScript==/);
  assert.match(metadata, /^\/\/ @name\s+\S/m);
  assert.match(metadata, /^\/\/ @description\s+\S/m);
  assert.match(metadata, /^\/\/ @version\s+\S/m);
  assert.match(metadata, /^\/\/ @namespace\s+\S/m);
  assert.match(metadata, /^\/\/ @license\s+\S/m);
  assert.match(metadata, /^\/\/ @match\s+https:\/\/medium\.com\/\*$/m);
  assert.match(metadata, /^\/\/ @match\s+https:\/\/\*\.medium\.com\/\*$/m);
  assert.match(metadata, /\/\/ ==\/UserScript==$/);
  assert.doesNotMatch(source, /==OpenUserJS==/);
  assert.doesNotMatch(metadata, /@name:/);
  assert.doesNotMatch(metadata, /@description:/);
});
