# Medium Author Stats Userscript

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-EA4AAA?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/andylilfs0217) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license) [![Install from GitHub](https://img.shields.io/badge/GitHub-install-181717?logo=github)](https://raw.githubusercontent.com/andylilfs0217/medium-author-stats/main/medium-author-stats.user.js)

Tampermonkey / Violentmonkey userscript for **Medium** author profile pages. It adds a **Stats** button next to the profile **Follow** button and opens an in-page modal with author-level post statistics, engagement ratios, a trend chart, and top posts.

| | |
| --- | --- |
| **Repository** | [andylilfs0217/medium-author-stats](https://github.com/andylilfs0217/medium-author-stats) |
| **Install (users)** | [Raw userscript](https://raw.githubusercontent.com/andylilfs0217/medium-author-stats/main/medium-author-stats.user.js) |
| **Issues** | [GitHub Issues](https://github.com/andylilfs0217/medium-author-stats/issues) |

**Works on:** `https://medium.com/*` and `https://*.medium.com/*`

## What it shows

- Followers, newsletter subscribers, Medium membership date, and post counts.
- Total claps, responses, clappers, reposts, locked posts, and reading time.
- Per-post and per-follower engagement ratios.
- A publishing-order trend chart for claps, responses, clappers, and reposts.
- Hover details for each chart post, with click-through to the Medium post.
- Top posts by claps.

## Install

### Install from GitHub (raw URL)

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Use this **raw** script URL:

   ```
   https://raw.githubusercontent.com/andylilfs0217/medium-author-stats/main/medium-author-stats.user.js
   ```

3. In Tampermonkey: **Dashboard -> Utilities -> Install from URL** (wording may vary), paste the URL, and confirm.

### Install by pasting the file

In your userscript manager, create a new script, paste the contents of [`medium-author-stats.user.js`](./medium-author-stats.user.js), and save.

## How to use

1. Open a Medium author profile, for example `https://medium.com/@username`.
2. Click the **Stats** button next to **Follow**.
3. Wait while the script loads the author's posts through Medium's in-page GraphQL endpoint.
4. Review the summary cards, engagement ratios, chart, and top-post table in the modal.

## Requirements

- A recent **Chrome**, **Firefox**, **Edge**, or **Safari** with Tampermonkey or Violentmonkey.
- A Medium page where the signed-in or public session can access the author's profile posts.
- Network access to Medium's same-origin GraphQL endpoint.

## Troubleshooting

| Problem | What to try |
| --- | --- |
| The **Stats** button does not appear | Refresh the author profile page and confirm the URL is on `medium.com` or a `*.medium.com` publication domain. |
| “Could not determine the Medium username for this page” | Open the author's profile page directly, such as `https://medium.com/@username`, instead of an article page. |
| The modal loads forever or shows an HTTP error | Medium may be rate-limiting, blocking, or changing the profile GraphQL response. Refresh and try again after a short wait. |
| Counts look different from the visible feed | Medium may hide, personalize, or delay some engagement numbers. The script uses the profile GraphQL data returned to your current browser session. |
| Other errors | **F12** -> **Console**, look for lines starting with `[Medium Author Stats]`. |

## Background

This is a Tampermonkey userscript version of [BSalwiczek/medium-any-author-stats](https://github.com/BSalwiczek/medium-any-author-stats). I searched Greasy Fork and broader userscript results for Medium author statistics scripts and found Medium reading/paywall helpers and copies/listings of the Chrome extension, but not a userscript that replicates this author analytics workflow.

## Support

This script is maintained in my spare time. If it saves you hassle and you would like to say thanks, you can **[become a sponsor on GitHub](https://github.com/sponsors/andylilfs0217)**. Sponsorship is optional; the script stays free and MIT-licensed either way.

## Legal

You are responsible for following applicable law and Medium's terms. This tool is for legitimate personal use only.

## License

Distributed under the MIT License.

---

<details>
<summary><strong>Development</strong> (maintainers)</summary>

- Main script: [`medium-author-stats.user.js`](./medium-author-stats.user.js).
- Focused tests: [`tests/render-chart.test.mjs`](./tests/render-chart.test.mjs).
- Run tests with:

  ```
  node --test tests/render-chart.test.mjs
  ```

- Check userscript syntax with:

  ```
  node --check medium-author-stats.user.js
  ```

**Release checklist**

1. Bump `// @version` in [`medium-author-stats.user.js`](./medium-author-stats.user.js).
2. Update this README if install, usage, or visible metrics changed.
3. Run `node --test tests/render-chart.test.mjs`.
4. Run `node --check medium-author-stats.user.js`.
5. Commit, push, and tag `vX.Y.Z` on GitHub if you use releases.

Do not change `// @namespace` or `// @name` unless you intend a new script identity in userscript managers.

</details>
