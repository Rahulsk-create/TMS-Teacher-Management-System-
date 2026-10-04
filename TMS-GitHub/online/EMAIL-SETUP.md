# TMS email setup

Preferred reply-to: **talk.brightsidestudio@gmail.com**.

This package does not create or verify that Gmail mailbox. Complete Google account setup yourself if it does not already exist. Do not share its password in chat or commit it to GitHub.

Outgoing email is disabled until the server has a sending provider configured. The included adapter uses Resend. A Gmail mailbox alone is not sufficient for this adapter: EMAIL_FROM must use a domain verified with the provider.

1. Set up your sender domain with the provider and complete its domain verification.
2. In the hosting service's private environment/secret settings, set RESEND_API_KEY and EMAIL_FROM (your verified sender address).
3. Set EMAIL_REPLY_TO=talk.brightsidestudio@gmail.com after confirming you control that mailbox.
4. Restart the server. An administrator/coordinator can create a draft under ERP workspace > Communication, review the recipient and contents, then explicitly send it.
5. Check the provider's delivery records. The app's accepted status means the provider accepted the request, not that the recipient received it. An uncertain result requires checking the provider before trying again.

Do not put real API keys in .env.example, source files, shared ZIPs or GitHub. No automatic scheduled email, SMS service, Gmail login integration or delivery webhook is included. Internal ERP messages do not require an email provider.
