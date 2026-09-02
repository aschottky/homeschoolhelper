import { Shield } from 'lucide-react'
import LegalDoc from './LegalDoc'

function PrivacyPolicy() {
  return (
    <LegalDoc icon={Shield} title="Privacy Policy" lastUpdated="September 2, 2026">
      <p className="legaldoc-intro">
        HomeSchool Helper (&ldquo;HomeSchool Helper,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
        helps homeschooling families track hours, subjects, schedules, and records. This Privacy
        Policy explains what information we collect, how we use it, and the choices you have. It
        applies to <a href="https://homeschoolhelper.app">homeschoolhelper.app</a> and the
        HomeSchool Helper application.
      </p>

      <div className="legaldoc-callout">
        <p>
          <strong>Families come first.</strong> We do not sell your personal information or your
          children&rsquo;s information, and we never share your education records with third parties
          except the service providers needed to run the app, or when required by law.
        </p>
      </div>

      <div className="legaldoc-toc">
        <h2>Contents</h2>
        <ol>
          <li>Information we collect</li>
          <li>How we use information</li>
          <li>Children&rsquo;s information</li>
          <li>Service providers</li>
          <li>Cookies &amp; advertising</li>
          <li>Data retention</li>
          <li>Your rights &amp; choices</li>
          <li>Security</li>
          <li>Changes</li>
          <li>Contact us</li>
        </ol>
      </div>

      <h2>1. Information we collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li><strong>Account details</strong> — your name and email address when you register, or your Google account profile (name, email) if you sign in with Google.</li>
        <li><strong>Homeschool profile</strong> — optional details such as your homeschool name, guardians, address, and state, used for records and compliance reports.</li>
        <li><strong>Children&rsquo;s information</strong> — the names, and optionally birth dates and grade levels, of the children you add.</li>
        <li><strong>Education records</strong> — the subjects, hours, schedules, lessons, grades, reading logs, activities, and any schoolwork samples or notes you enter.</li>
        <li><strong>Payment information</strong> — if you subscribe, your payment is processed by Stripe. We receive a customer and subscription identifier and your subscription status; we never receive or store your full card number.</li>
        <li><strong>Communications</strong> — messages you send us by email.</li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li><strong>Authentication data</strong> — a secure session cookie that keeps you signed in.</li>
        <li><strong>Basic technical data</strong> — such as your browser type and general usage, used to keep the service running and secure.</li>
      </ul>

      <h2>2. How we use information</h2>
      <p>We use the information above to:</p>
      <ul>
        <li>Provide and maintain the tracker and generate your reports and records;</li>
        <li>Create and secure your account and keep you signed in;</li>
        <li>Process subscriptions and send related billing notices;</li>
        <li>Send account emails such as password resets;</li>
        <li>Respond to your requests and support questions;</li>
        <li>Protect against fraud, abuse, and security threats, and comply with legal obligations.</li>
      </ul>

      <h2>3. Children&rsquo;s information</h2>
      <p>
        HomeSchool Helper is designed for <strong>parents and guardians</strong>, not for children.
        Accounts may only be created by adults. Any information about a child in the app is entered
        by the parent or guardian who controls the account, is used solely to provide the tracking
        and record-keeping features to that family, and is never used for advertising or sold to
        anyone. As the account holder, you can view, edit, or delete your children&rsquo;s
        information at any time from within the app.
      </p>

      <h2>4. Service providers</h2>
      <p>We share information only with the providers that operate the service on our behalf:</p>
      <ul>
        <li><strong>Vercel</strong> — website and application hosting.</li>
        <li><strong>Neon</strong> — the database where your account and records are stored.</li>
        <li><strong>Stripe</strong> — subscription payment processing.</li>
        <li><strong>Google</strong> — optional &ldquo;Sign in with Google&rdquo; authentication.</li>
        <li><strong>Resend</strong> — delivery of account emails such as password resets.</li>
      </ul>
      <p>
        These providers may only use the information to perform their services for us. We may also
        disclose information if required by law, or to protect the rights, safety, and security of
        our users or the public.
      </p>

      <h2>5. Cookies &amp; advertising</h2>
      <p>
        We use a small number of cookies that are essential to signing you in and keeping your
        session secure. HomeSchool Helper may display advertising from <strong>Google AdSense</strong>
        and may include <strong>Amazon Associates</strong> affiliate links in book recommendations.
        These partners may use cookies to show or measure ads; you can manage ad personalization in
        your <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.
        We do not share the names, records, or other personal details you enter with advertisers.
      </p>

      <h2>6. Data retention</h2>
      <p>
        We keep your information for as long as your account is active. If you delete a child, a
        record, or your entire account, the associated data is removed from our active systems.
        Some information may remain in routine backups for a limited time, and we may retain limited
        records where required for legal, tax, or security purposes.
      </p>

      <h2>7. Your rights &amp; choices</h2>
      <ul>
        <li><strong>Access &amp; correction</strong> — view and edit your profile, children, and records directly in the app.</li>
        <li><strong>Deletion</strong> — delete individual records, children, or your whole account at any time.</li>
        <li><strong>Marketing</strong> — we only send you account and service emails; we do not send marketing spam.</li>
      </ul>
      <p>
        Depending on where you live, you may have additional rights over your personal information.
        To make a request, contact us using the details below.
      </p>

      <h2>8. Security</h2>
      <p>
        We protect your data with encryption in transit (HTTPS), hashed passwords, access controls
        that scope every record to your account, and reputable infrastructure providers. No system
        is perfectly secure, but we work to safeguard your information and to respond promptly to any
        issue.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last
        updated&rdquo; date above, and significant changes will be reflected in the app.
      </p>

      <h2>10. Contact us</h2>
      <p>
        Questions about this policy or your data? Email us at{' '}
        <a href="mailto:hello@homeschoolhelper.com">hello@homeschoolhelper.com</a>.
      </p>
    </LegalDoc>
  )
}

export default PrivacyPolicy
