# CSBP441 live attendance backend

This Google Apps Script web app gives the attendance page shared server state. The instructor console and student QR page are hosted together, while Google Sheets stores class rosters, sessions, and check-ins.

## One-time setup

1. Create a blank Google Sheet for attendance records.
2. In the Sheet, select **Extensions > Apps Script**.
3. Replace the default `Code.gs` with the repository's `Code.gs` file.
4. Add an HTML file named `Index` and paste the repository's `Index.html` into it.
5. Save the project.
6. Select `setupAttendanceSystem` in the Apps Script function menu and select **Run**.
7. Approve the spreadsheet permission and enter a new instructor passphrase with at least 12 characters. Do not use an institutional password.
8. Select **Deploy > New deployment > Web app**.
9. Set **Execute as** to **Me** and **Who has access** to **Anyone** so students are not asked to sign in.
10. Deploy and copy the URL ending in `/exec`.
11. Open the CSBP441 attendance page, paste that URL into **Google Apps Script web app URL**, and save it.

If the Google Workspace administrator does not offer **Anyone**, deploy from an account that permits anonymous web apps or use another backend platform.

## Updating the application

After changing `Code.gs` or `Index.html`, select **Deploy > Manage deployments**, edit the existing deployment, choose **New version**, and deploy it. Keeping the existing deployment preserves the `/exec` URL.

## Security model

- Students do not log in.
- Instructor operations require the passphrase.
- The passphrase is salted and hashed in Script Properties; it is not written to the spreadsheet.
- Rotating codes are generated and validated on the server.
- A student must match the selected class roster.
- Duplicate attendance for the same session is rejected.
- Removing student authentication means ID sharing cannot be completely prevented.
