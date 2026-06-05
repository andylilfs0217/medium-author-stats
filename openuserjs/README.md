# OpenUserJS

[OpenUserJS.org](https://openuserjs.org/) can host a second listing for this script. Updates are imported from GitHub and can be triggered with a GitHub webhook once accounts are linked.

## Limits

- **Transfer size:** 1,048,576 bytes (1 MiB) per script. This repo's `user-script.js` is far below that.
- The `// ==OpenUserJS==` block in `user-script.js` sets `@author` to the OpenUserJS username. Update it if your OpenUserJS account uses a different name.

## One-time: GitHub authentication on OpenUserJS

1. Sign in to [OpenUserJS](https://openuserjs.org/).
2. Open [User -> Preferences](https://openuserjs.org/user/preferences) and add GitHub as a supported authentication / linking strategy.

## Publish or link the script

**Option A - Import from GitHub**

1. Use **Import Script from GitHub** from your user scripts area.
2. Choose repository `andylilfs0217/medium-author-stats`, branch `main`, file `user-script.js`.
3. Complete the import so the script exists on OpenUserJS under your user.

**Option B - New script, then sync**

1. **New Script -> Upload Script** with the same `user-script.js` from the repo, or paste source.
2. In the script's settings on OpenUserJS, attach **Sync Script** / **GitHub** to the same repo path.

## Auto-update on every push

OpenUserJS documents adding a GitHub webhook so the site is notified on push and can sync without waiting for a manual poll.

1. On OpenUserJS, open the sync / GitHub / webhook instructions for your script or account.
2. Copy the payload URL and secret if shown.
3. On GitHub: **Repository -> Settings -> Webhooks -> Add webhook**
   - **Payload URL:** paste the OpenUserJS URL
   - **Content type:** `application/json` if OpenUserJS asks for it
   - **Events:** usually **Just the push event**

## Maintainer checklist

- [ ] OpenUserJS username in `// ==OpenUserJS==` / `@author` matches the account that owns the listing.
- [ ] `@version` in `user-script.js` is bumped for each release.
- [ ] README and GreasyFork links point at the current repo path.

## Links

- Author scripts: [openuserjs.org/users/andylilfs0217/scripts](https://openuserjs.org/users/andylilfs0217/scripts)
- FAQ: [openuserjs.org/about/Frequently-Asked-Questions](https://openuserjs.org/about/Frequently-Asked-Questions)
