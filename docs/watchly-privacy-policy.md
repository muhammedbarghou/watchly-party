# Watchly — Privacy Policy

**Last updated:** [DATE]

> **Note before you publish this:** This is a starting draft based on Watchly's actual
> data practices (Supabase for auth/database, ephemeral chat, peer-to-peer voice, no file
> uploads in v1). It is not legal advice. Have a lawyer review it before launch —
> especially around GDPR (if you'll have EU users), CCPA (California users), and any
> cookie/consent-banner requirements for your target regions. Bracketed items like
> **[COMPANY NAME]** need to be filled in.

---

## 1. Who We Are

This Privacy Policy explains how **[COMPANY NAME / YOUR NAME]** ("we," "us," "our")
collects, uses, and protects information when you use Watchly (the "Service").

---

## 2. What We Collect

### 2.1 Account Information
When you sign up, we collect:
- Email address (used for login and password recovery, via our authentication provider)
- Username and, optionally, an avatar image URL
- Your account's unique identifier

### 2.2 Room and Friend Data
- Rooms you create: room name, video link, whether the room is private, whether it's
  visible to friends, and (if private) a **hashed** version of the room password — we
  never store passwords in plain text
- Friend connections: who you've sent/received friend requests to or from, and the
  status of those requests (pending/accepted)

### 2.3 What We *Don't* Store
- **Chat messages** — in-room text chat is broadcast in real time and is not saved to
  our database. It disappears when the room closes or you disconnect.
- **Voice chat audio** — voice is transmitted directly between participants
  (peer-to-peer WebRTC); it does not pass through or get recorded by our servers.
- **Video files** — Watchly does not host video content in its current version; you
  bring in a link to a video hosted elsewhere (e.g. YouTube), and no video file is
  uploaded to or stored by us.
- **Live room state** — who's currently in a room, current playback position, and
  similar moment-to-moment state lives temporarily in server memory while the room is
  active and is not written to our database.

### 2.4 Automatically Collected Information
- Standard technical data needed to operate the Service (e.g. IP address for connection
  purposes, basic session/device info). We use this only to run and secure the Service,
  not to build advertising profiles.

---

## 3. How We Use Your Information

We use the information above to:
- Create and manage your account, and let you log in
- Let you create/join rooms, and manage friend connections
- Enforce room privacy settings (e.g. checking a hashed password before letting you
  join a private room)
- Enforce bans (if a room admin bans you from a room, we keep a record of that so you
  can't rejoin it)
- Maintain the security and reliability of the Service (e.g. rate-limiting to prevent
  abuse, detecting suspicious activity)
- Communicate with you about your account (e.g. password reset emails)

We do not sell your personal information.

---

## 4. Who We Share Information With

- **Service providers:** we use Supabase for authentication and database hosting, and a
  VPS provider to host our real-time server. These providers process data on our behalf
  to run the Service and are bound by their own data-processing terms.
- **Other users:** your username, avatar, and public room activity (if you've enabled
  "visible to friends") are visible to your accepted friends. Room admins can see the
  identity of participants in their own rooms.
- **Legal requirements:** we may disclose information if required by law, or to protect
  the rights, safety, or property of Watchly, our users, or others (e.g. responding to a
  valid legal request or a copyright takedown notice).

We don't share your information with third parties for their own marketing purposes.

---

## 5. Third-Party Video Links

Watchly lets you paste links to videos hosted on third-party platforms (e.g. YouTube,
Vimeo). When you or another participant plays such a link, you're interacting with that
third party's service, subject to their own privacy policy — we don't control what data
they collect when a video plays.

---

## 6. Data Retention

- **Account, room, and friendship data** is kept for as long as your account is active.
- **Chat messages and voice audio** are never retained — they exist only transiently
  during a live room session (see 2.3).
- If you delete your account, we delete your account information, room records you
  created, and friendship records associated with you, except where we're required to
  retain something for legal or security reasons (e.g. a ban record tied to a room you
  don't own, to prevent re-abuse).

---

## 7. Your Rights and Choices

Depending on where you live, you may have rights to:
- Access the personal information we hold about you
- Correct inaccurate information
- Delete your account and associated data
- Object to or restrict certain processing

To exercise these rights, contact us at **[CONTACT EMAIL]**.
**[This section should be expanded with specific GDPR/CCPA language by a lawyer if you'll
have users in the EU or California.]**

---

## 8. Security

We use industry-standard practices to protect your data, including hashing room
passwords and relying on our authentication provider's secure session handling. No
system is 100% secure, and we can't guarantee absolute security of information
transmitted to or from the Service.

---

## 9. Children's Privacy

Watchly is not directed at children under **[13 / 16 — confirm with counsel]**, and we do
not knowingly collect information from children under that age. If you believe a child
has created an account, contact us so we can take appropriate action.

---

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. If we make material changes, we'll
make a reasonable effort to notify users (e.g. via email or an in-app notice) before the
changes take effect.

---

## 11. Contact

Questions about this Privacy Policy or your data? Contact us at **[CONTACT EMAIL]**.
