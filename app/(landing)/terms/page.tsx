import type { Metadata } from "next"
import Link from "next/link"

import { LegalDocument } from "@/components/landing/legal-document"

export const metadata: Metadata = {
  title: "Terms of Service | Watchly",
  description:
    "Terms of Service for Watchly — the virtual watch-party platform for watching videos together in sync.",
}

const CONTACT_EMAIL = "support@watchly.app"
const LAST_UPDATED = "August 9, 2026"

const TermsPage = () => {
  return (
    <LegalDocument title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <section aria-labelledby="terms-who">
        <h2 id="terms-who">1. Who These Terms Apply To</h2>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of Watchly (the &quot;Service&quot;), operated by Watchly Inc.
          (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;). By creating an
          account or using Watchly, you agree to these Terms. If you don&apos;t
          agree, don&apos;t use the Service.
        </p>
        <p>
          You must be at least <strong>13</strong> years old to use Watchly.
        </p>
      </section>

      <section aria-labelledby="terms-account">
        <h2 id="terms-account">2. Your Account</h2>
        <ul>
          <li>
            You need an account (email + password via our authentication
            provider) to create or join rooms.
          </li>
          <li>
            You&apos;re responsible for keeping your login credentials secure
            and for all activity that happens under your account.
          </li>
          <li>
            You agree to provide accurate information when you sign up (e.g. a
            working email address for password recovery).
          </li>
          <li>
            You can delete your account at any time; see our{" "}
            <Link href="/privacy">Privacy Policy</Link> for what happens to
            your data when you do.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-rooms">
        <h2 id="terms-rooms">3. Rooms, Content, and Conduct</h2>

        <h3>3.1 Creating and Joining Rooms</h3>
        <ul>
          <li>
            Any user can create a room, set it public or private
            (password-protected), and choose whether it&apos;s visible to their
            friends.
          </li>
          <li>
            The room creator is automatically the room&apos;s{" "}
            <strong>admin</strong>, with control over playback, room
            membership, and moderation (see 3.3).
          </li>
          <li>
            Rooms are joined via a unique code, an accepted friend-discovery
            request, or an admin-sent invite.
          </li>
        </ul>

        <h3>3.2 Video Content</h3>
        <ul>
          <li>
            In its current version, Watchly does not host video files — you can
            only bring in video via a link to a third-party platform (e.g.
            YouTube, Vimeo) or a direct video URL.
          </li>
          <li>
            <strong>
              We don&apos;t control, endorse, or take responsibility for
              third-party content
            </strong>{" "}
            played through links in a Watchly room. Playing a video link
            doesn&apos;t mean we&apos;ve reviewed or approved it.
          </li>
          <li>
            You agree not to share links to content that is illegal, infringes
            someone else&apos;s copyright, or that you don&apos;t have the right
            to share.
          </li>
          <li>
            If we receive a valid copyright or legal takedown request related to
            content shared through the Service, we may remove access to the
            relevant room or restrict the account involved.
          </li>
        </ul>

        <h3>3.3 Room Admin Powers</h3>
        <ul>
          <li>
            Room admins can mute, kick, or ban participants from their own room,
            and can transfer admin status to another participant.
          </li>
          <li>
            Admin actions apply only within that admin&apos;s own room — they
            don&apos;t give one user control over another user&apos;s account or
            data outside that room.
          </li>
          <li>
            We are not responsible for how individual room admins choose to
            moderate their rooms, but we may step in at the platform level for
            violations of these Terms (e.g. harassment reports, abuse of the
            Service).
          </li>
        </ul>

        <h3>3.4 Chat and Voice</h3>
        <ul>
          <li>
            Text chat in a room is <strong>ephemeral</strong> — it is not stored
            by us and disappears when the room closes or you disconnect. We
            don&apos;t retain a record of what was said in chat.
          </li>
          <li>
            Voice chat is transmitted directly between participants
            (peer-to-peer) and is not recorded or stored by us.
          </li>
          <li>
            You&apos;re responsible for what you say in a room&apos;s chat or
            voice channel. Don&apos;t use Watchly to harass, threaten, or abuse
            other users.
          </li>
        </ul>

        <h3>3.5 Friends</h3>
        <ul>
          <li>
            Adding a friend requires mutual acceptance. Being someone&apos;s
            friend on Watchly lets them see your public live rooms (if
            you&apos;ve enabled that) and vice versa.
          </li>
          <li>
            You can unfriend someone at any time, which removes that mutual
            visibility.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-acceptable-use">
        <h2 id="terms-acceptable-use">4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Use Watchly for anything illegal, or to share content that violates
            someone else&apos;s rights (copyright, privacy, etc.)
          </li>
          <li>
            Attempt to access another user&apos;s account, or a
            private/password-protected room you haven&apos;t been invited to
          </li>
          <li>
            Attempt to disrupt the Service (e.g. denial-of-service attempts,
            exploiting bugs to gain unauthorized access, brute-forcing room
            passwords)
          </li>
          <li>
            Use automated tools (bots, scrapers) against the Service without our
            permission
          </li>
          <li>
            Harass, threaten, or abuse other users in text chat, voice chat, or
            through the friends system
          </li>
        </ul>
        <p>
          We may suspend or terminate accounts that violate these Terms.
        </p>
      </section>

      <section aria-labelledby="terms-availability">
        <h2 id="terms-availability">5. Service Availability</h2>
        <ul>
          <li>
            Watchly is provided &quot;as is.&quot; Room state (who&apos;s
            connected, current playback position) is held in server memory for
            the life of a room and is not guaranteed to survive a server restart
            or outage — meaning an active room could be interrupted by planned or
            unplanned downtime.
          </li>
          <li>
            We don&apos;t guarantee the Service will be available at all times,
            error-free, or uninterrupted.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-termination">
        <h2 id="terms-termination">6. Termination</h2>
        <ul>
          <li>
            You can stop using Watchly and delete your account at any time.
          </li>
          <li>
            We may suspend or terminate your account if you violate these Terms,
            or if we&apos;re required to do so by law.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-liability">
        <h2 id="terms-liability">7. Disclaimers &amp; Limitation of Liability</h2>
        <ul>
          <li>
            Watchly is provided without warranties of any kind, express or
            implied, to the fullest extent permitted by law.
          </li>
          <li>
            We are not liable for content shared by users (including third-party
            video links), actions taken by room admins within their own rooms, or
            losses resulting from service interruptions or data loss consistent
            with the ephemeral nature of chat/room state described above.
          </li>
        </ul>
      </section>

      <section aria-labelledby="terms-changes">
        <h2 id="terms-changes">8. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. If we make material
          changes, we&apos;ll make a reasonable effort to notify users (e.g. via
          email or an in-app notice) before the changes take effect. Continued
          use of Watchly after changes take effect means you accept the updated
          Terms.
        </p>
      </section>

      <section aria-labelledby="terms-contact">
        <h2 id="terms-contact">9. Contact</h2>
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalDocument>
  )
}

export default TermsPage
