Snippets of FatShark's React frontend from Firefoxs debugger; (selected) file contents and names copied verbatim from the debugger.

## Raw structure (in debugger)

`...` = not interesting but annotated for reference.

```
Main Thread
  accounts.atoma.cloud
    modules/                   // ... Looks to be internal React _stuff_.
    node_modules/
    src/                       // ... The source of some date library (Luxton).
    static/                    // Their React frontend.
      node_modules/
      js/
        assets/                // ... JPG textures.
        components/
          account-dashboard/   // ... React FCs account details, character list.
          form/                // ... FatShark account email form.
            fields/
          login/               // ... React FCs login.
          redeem-code/         // ... React FCs for giveaway codes.
          register/            // ... React FCs specifically for their newsletter.
          shared/              // ... Layout, buttons, etc.
          twitch-drops/        // ... React FCs Twitch linking and drop information.
        config/                // Usual config but also Atoma cloud URLs and OpenID URLs.
        context/               // React components to handle authentication (JWT) refresh and a message context called Snackbar.
        pages/                 // React components. AuthHandler file mentions `openid`.
          login/               // React components handling initial authentication flow.
        render/                // ... Basic React components.
        transfer/              // Authentication routes, token refresh routes, some other prior-unknown API routes.
        utils/                 // Basic helper functions but also has information on class specialisations.
    login                      // ... React root.
```