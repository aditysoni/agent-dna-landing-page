# Form submissions → Google Sheet

The Get a demo, Contact and Health check forms (`demo.js`) and the vulnerability report form (`vuln.js`) send each
submission to a Google Sheet, one tab per form. The sending code and the URL are in `site.js`.
This folder is setup only. Don't upload it to the server.

## Setup (once, about 5 minutes)

1. Open the sheet: https://docs.google.com/spreadsheets/d/1SrXvpP9Xt6zgS4LVpLOKmGj7GDivKg6F44mwwStU7rY/edit
2. **Extensions → Apps Script**. Replace the code with `Code.gs` and save. It already includes the older
   email sign-up handler (Registrations tab), so that keeps working.
3. **Deploy → New deployment** → gear icon → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, and allow the permissions it asks for.
4. Copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`).
5. Paste it into `SHEET_URL` at the top of `site.js`, then upload `site.js` to the server.

The tabs `demo`, `contact`, `health-check` and `vulnerability` are created with a header row on the first submission.
To get an Excel file: **File → Download → Microsoft Excel (.xlsx)**.

## Changing Code.gs later

Edit it in Apps Script, then **Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy**.
This keeps the same URL. A *New deployment* gives a new URL, which would then have to go into `site.js`.

## Notes

- The URL is public, as any form endpoint on a static site is. Anyone who finds it can add rows, so look out for spam.
- The browser can't read the script's reply (no-cors). The form shows an error only when the request fails to send.
  If rows stop appearing, check **Executions** in Apps Script.
