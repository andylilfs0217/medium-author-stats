# Medium Author Stats Userscript

This is a Tampermonkey userscript version of [BSalwiczek/medium-any-author-stats](https://github.com/BSalwiczek/medium-any-author-stats). It adds a `Stats` button directly on Medium author profile pages, next to the profile `Follow` button, and opens the author statistics in a modal.

I searched Greasy Fork and broader userscript results for Medium author statistics scripts. I found Medium reading/paywall helpers and copies/listings of the Chrome extension, but not a Tampermonkey script that replicates this author analytics workflow.

## Install

1. Open `medium-author-stats.user.js`.
2. Copy its contents into a new Tampermonkey script.
3. Save it, then open a Medium author profile such as `https://medium.com/@username`.
4. Click the in-page `Stats` button next to `Follow`.

## What It Shows

- Followers
- Total posts and locked posts
- Newsletter subscribers
- Medium membership date
- Total claps, responses, clappers, and reading time
- Per-post and per-follower engagement ratios
- A simple post trend chart
- Top posts by claps

The script uses Medium's same in-page GraphQL endpoint and only runs on `medium.com` pages.
