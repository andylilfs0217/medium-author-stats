# Medium Author Stats Userscript

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-EA4AAA?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/andylilfs0217) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/andylilfs0217/medium-author-stats/blob/main/LICENSE) [![Install from GitHub](https://img.shields.io/badge/GitHub-install-181717?logo=github)](https://raw.githubusercontent.com/andylilfs0217/medium-author-stats/main/user-script.js)

Tampermonkey / Violentmonkey userscript for **Medium** author profile pages. It adds a **Stats** button next to the profile **Follow** button and opens an in-page modal with author-level post statistics, engagement ratios, a trend chart, and top posts.

| | |
| --- | --- |
| **Repository** | [andylilfs0217/medium-author-stats](https://github.com/andylilfs0217/medium-author-stats) |
| **Install (users)** | [Raw userscript](https://raw.githubusercontent.com/andylilfs0217/medium-author-stats/main/user-script.js) |
| **Issues** | [GitHub Issues](https://github.com/andylilfs0217/medium-author-stats/issues) |

**Works on:** `https://medium.com/*` and `https://*.medium.com/*`

## What it shows

- Followers, newsletter subscribers, Medium membership date, and post counts.
- Total claps, responses, clappers, reposts, locked posts, and reading time.
- Per-post and per-follower engagement ratios.
- A publishing-order trend chart for claps, responses, clappers, and reposts.
- Hover details for each chart post, with click-through to the Medium post.
- Top posts by claps.

## How to use

1. Install the script with Tampermonkey or Violentmonkey.
2. Open a Medium author profile, for example `https://medium.com/@username`.
3. Click the **Stats** button next to **Follow**.
4. Wait while the script loads the author's posts through Medium's in-page GraphQL endpoint.

## Requirements

- A recent **Chrome**, **Firefox**, **Edge**, or **Safari** with Tampermonkey or Violentmonkey.
- A Medium page where the signed-in or public session can access the author's profile posts.
- Network access to Medium's same-origin GraphQL endpoint.

## Troubleshooting

| Problem | What to try |
| --- | --- |
| The **Stats** button does not appear | Refresh the author profile page and confirm the URL is on `medium.com` or a `*.medium.com` publication domain. |
| "Could not determine the Medium username for this page" | Open the author's profile page directly, such as `https://medium.com/@username`, instead of an article page. |
| The modal loads forever or shows an HTTP error | Medium may be rate-limiting, blocking, or changing the profile GraphQL response. Refresh and try again after a short wait. |
| Counts look different from the visible feed | Medium may hide, personalize, or delay some engagement numbers. The script uses the profile GraphQL data returned to your current browser session. |
| Other errors | **F12** -> **Console**, look for lines starting with `[Medium Author Stats]`. |

## Support

This script is maintained in my spare time. If it saves you hassle and you would like to say thanks, you can **[become a sponsor on GitHub](https://github.com/sponsors/andylilfs0217)**. Sponsorship is optional; the script stays free and MIT-licensed either way.

## Legal

You are responsible for following applicable law and Medium's terms. This tool is for legitimate personal use only.

## License

Distributed under the MIT License - see [LICENSE](https://github.com/andylilfs0217/medium-author-stats/blob/main/LICENSE).
