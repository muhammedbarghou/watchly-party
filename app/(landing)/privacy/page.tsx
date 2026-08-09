import type { Metadata } from "next"

import { LegalDocument } from "@/components/landing/legal-document"

export const metadata: Metadata = {
  title: "Privacy Policy | Watchly",
  description:
    "Privacy Policy for Watchly — how we collect, use, and protect your information.",
}

const CONTACT_EMAIL = "support@watchly.app"
const LAST_UPDATED = "August 9, 2026"

const PrivacyPage = () => {
  return (
    <LegalDocument title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <section aria-labelledby="privacy-who">
        <h2 id="privacy-who">1. Who We Are</h2>
        <p>
          This Privacy Policy explains how Watchly Inc. (&quot;we,&quot;
          &quot;us,&quot; &quot;our&quot;) collects, uses, and protects
          information when you use Watchly (the &quot;Service&quot;).
        </p>
      </section>

      <section aria-labelledby="privacy-collect">
        <h2 id="privacy-collect">2. What We Collect</h2>

        <h3>2.1 Account Information</h3>
        <p>When you sign up, we collect:</p>
        <ul>
          <li>
            Email address (used for login and password recovery, via our
            authentication provider)
          </li>
          <li>Username and, optionally, an avatar image URL</li>
          <li>Your account&apos;s unique identifier</li>
        </ul>

        <h3>2.2 Room and Friend Data</h3>
        <ul>
          <li>
            Rooms you create: room name, video link, whether the room is
            private, whether it&apos;s visible to friends, and (if private) a{" "}
            <strong>hashed</strong> version of the room password — we never
            store passwords in plain text
          </li>
          <li>
            Friend connections: who you&apos;ve sent/received friend requests to
            or from, and the status of those requests (pending/accepted)
          </li>
        </ul>

        <h3>2.3 What We Don&apos;t Store</h3>
        <ul>
          <li>
            <strong>Chat messages</strong> — in-room text chat is broadcast in
            real time and is not saved to our database. It disappears when the
            room closes or you disconnect.
          </li>
          <li>
            <strong>Voice chat audio</strong> — voice is transmitted directly
            between participants (peer-to-peer WebRTC); it does not pass through
            or get recorded by our servers.
          </li>
          <li>
            <strong>Video files</strong> — Watchly does not host video content
            in its current version; you bring in a link to a video hosted
            elsewhere (e.g. YouTube), and no video file is uploaded to or stored
            by us.
          </li>
          <li>
            <strong>Live room state</strong> — who&apos;s currently in a room,
            current playback position, and similar moment-to-moment state lives
            temporarily in server memory while the room is active and is not
            written to our database.
          </li>
        </ul>

        <h3>2.4 Automatically Collected Information</h3>
        <ul>
          <li>
            Standard technical data needed to operate the Service (e.g. IP
            address for connection purposes, basic session/device info). We use
            this only to run and secure the Service, not to build advertising
            profiles.
          </li>
        </ul>
      </section>

      <section aria-labelledby="privacy-use">
        <h2 id="privacy-use">3. How We Use Your Information</h2>
        <p>We use the information above to:</p>
        <ul>
          <li>Create and manage your account, and let you log in</li>
          <li>Let you create/join rooms, and manage friend connections</li>
          <li>
            Enforce room privacy settings (e.g. checking a hashed password
            before letting you join a private room)
          </li>
          <li>
            Enforce bans (if a room admin bans you from a room, we keep a record
            of that so you can&apos;t rejoin it)
          </li>
          <li>
            Maintain the security and reliability of the Service (e.g.
            rate-limiting to prevent abuse, detecting suspicious activity)
          </li>
          <li>
            Communicate with you about your account (e.g. password reset emails)
          </li>
        </ul>
        <p>We do not sell your personal information.</p>
      </section>

      <section aria-labelledby="privacy-share">
        <h2 id="privacy-share">4. Who We Share Information With</h2>
        <ul>
          <li>
            <strong>Service providers:</strong> we use Supabase for
            authentication and database hosting, and a VPS provider to host our
            real-time server. These providers process data on our behalf to run
            the Service and are bound by their own data-processing terms.
          </li>
          <li>
            <strong>Other users:</strong> your username, avatar, and public room
            activity (if you&apos;ve enabled &quot;visible to friends&quot;) are
            visible to your accepted friends. Room admins can see the identity
            of participants in their own rooms.
          </li>
          <li>
            <strong>Legal requirements:</strong> we may disclose information if
            required by law, or to protect the rights, safety, or property of
            Watchly, our users, or others (e.g. responding to a valid legal
            request or a copyright takedown notice).
          </li>
        </ul>
        <p>
          We don&apos;t share your information with third parties for their own
          marketing purposes.
        </p>
      </section>

      <section aria-labelledby="privacy-video">
        <h2 id="privacy-video">5. Third-Party Video Links</h2>
        <p>
          Watchly lets you paste links to videos hosted on third-party platforms
          (e.g. YouTube, Vimeo). When you or another participant plays such a
          link, you&apos;re interacting with that third party&apos;s service,
          subject to their own privacy policy — we don&apos;t control what data
          they collect when a video plays.
        </p>
      </section>

      <section aria-labelledby="privacy-retention">
        <h2 id="privacy-retention">6. Data Retention</h2>
        <ul>
          <li>
            <strong>Account, room, and friendship data</strong> is kept for as
            long as your account is active.
          </li>
          <li>
            <strong>Chat messages and voice audio</strong> are never retained —
            they exist only transiently during a live room session (see 2.3).
          </li>
          <li>
            If you delete your account, we delete your account information, room
            records you created, and friendship records associated with you,
            except where we&apos;re required to retain something for legal or
            security reasons (e.g. a ban record tied to a room you don&apos;t
            own, to prevent re-abuse).
          </li>
        </ul>
      </section>

      <section aria-labelledby="privacy-rights">
        <h2 id="privacy-rights">7. Your Rights and Choices</h2>
        <p>Depending on where you live, you may have rights to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate information</li>
          <li>Delete your account and associated data</li>
          <li>Object to or restrict certain processing</li>
        </ul>
        <p>
          To exercise these rights, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section aria-labelledby="privacy-security">
        <h2 id="privacy-security">8. Security</h2>
        <p>
          We use industry-standard practices to protect your data, including
          hashing room passwords and relying on our authentication
          provider&apos;s secure session handling. No system is 100% secure, and
          we can&apos;t guarantee absolute security of information transmitted
          to or from the Service.
        </p>
      </section>

      <section aria-labelledby="privacy-children">
        <h2 id="privacy-children">9. Children&apos;s Privacy</h2>
        <p>
          Watchly is not directed at children under <strong>13</strong>, and we
          do not knowingly collect information from children under that age. If
          you believe a child has created an account, contact us so we can take
          appropriate action.
        </p>
      </section>

      <section aria-labelledby="privacy-changes">
        <h2 id="privacy-changes">10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If we make
          material changes, we&apos;ll make a reasonable effort to notify users
          (e.g. via email or an in-app notice) before the changes take effect.
        </p>
      </section>

      <section aria-labelledby="privacy-contact">
        <h2 id="privacy-contact">11. Contact</h2>
        <p>
          Questions about this Privacy Policy or your data? Contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalDocument>
  )
}

export default PrivacyPage
