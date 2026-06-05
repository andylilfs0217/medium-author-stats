# GreasyFork listing copy

[`DESCRIPTION.md`](./DESCRIPTION.md) mirrors the structure of the GitHub [`README.md`](../README.md) for Greasy Fork's **Additional info** field.

## Sync from GitHub

In Greasy Fork -> your script -> **Edit** -> **Default additional info**, set the URL to:

`https://raw.githubusercontent.com/andylilfs0217/medium-author-stats/main/greasyfork/DESCRIPTION.md`

Choose **Markdown**. After each push to `main`, trigger or wait for sync so the listing stays aligned with the repo.

## Code field

The Greasy Fork code field must contain only the userscript source:

`https://raw.githubusercontent.com/andylilfs0217/medium-author-stats/main/user-script.js`

Choose **Script**, not **Style/UserCSS**. If Greasy Fork links to Stylus/UserCSS docs or says `@name`, `@description`, `@version`, `@namespace`, or `@license` is missing, the wrong upload type or wrong content was used.

## Manual paste

1. Open [`DESCRIPTION.md`](./DESCRIPTION.md).
2. Copy **the entire file** into Greasy Fork -> **Edit** -> **Additional info**.
3. Save.

If you rename branches or move files, update URLs inside `DESCRIPTION.md`.
