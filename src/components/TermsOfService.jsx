import { FileText } from 'lucide-react'
import LegalDoc from './LegalDoc'

function TermsOfService() {
  return (
    <LegalDoc icon={FileText} title="Terms of Service" lastUpdated="September 2, 2026">
      <p className="legaldoc-intro">
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of HomeSchool Helper, available
        at <a href="https://homeschoolhelper.app">homeschoolhelper.app</a> (the &ldquo;Service&rdquo;).
        By creating an account or using the Service, you agree to these Terms. If you do not agree,
        please do not use the Service.
      </p>

      <div className="legaldoc-callout">
        <p>
          <strong>Not legal advice.</strong> HomeSchool Helper is a record-keeping tool. Homeschool
          laws and reporting requirements vary by state and change over time. Nothing in the Service
          is legal advice, and we do not guarantee that using it satisfies your jurisdiction&rsquo;s
          requirements. You are responsible for confirming and meeting your own legal obligations.
        </p>
      </div>

      <div className="legaldoc-toc">
        <h2>Contents</h2>
        <ol>
          <li>Who may use the Service</li>
          <li>Your account</li>
          <li>Subscriptions &amp; billing</li>
          <li>Your content</li>
          <li>Acceptable use</li>
          <li>Affiliate links &amp; ads</li>
          <li>Disclaimers</li>
          <li>Limitation of liability</li>
          <li>Termination</li>
          <li>Changes to the Service &amp; Terms</li>
          <li>Governing law</li>
          <li>Contact us</li>
        </ol>
      </div>

      <h2>1. Who may use the Service</h2>
      <p>
        You must be at least 18 years old and able to form a binding contract to create an account.
        The Service is intended for parents and guardians managing their family&rsquo;s homeschooling.
        You are responsible for anyone you allow to use your account.
      </p>

      <h2>2. Your account</h2>
      <p>
        You are responsible for keeping your login credentials secure and for all activity under
        your account. You agree to provide accurate information and to notify us promptly of any
        unauthorized use. You may sign in with an email and password or with Google.
      </p>

      <h2>3. Subscriptions &amp; billing</h2>
      <ul>
        <li>HomeSchool Helper offers free features and an optional paid <strong>Premium</strong> subscription, billed monthly or annually.</li>
        <li>Payments are processed by <strong>Stripe</strong>. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel.</li>
        <li>Subscriptions <strong>renew automatically</strong> at the end of each billing period at the then-current price, unless you cancel before the renewal date.</li>
        <li>You can cancel anytime from your account; cancellation takes effect at the end of the current billing period, and you keep Premium access until then.</li>
        <li>Except where required by law, payments are non-refundable, and we do not provide prorated refunds for partial periods.</li>
        <li>We may change subscription prices; changes apply to future billing periods and we will give reasonable notice.</li>
      </ul>

      <h2>4. Your content</h2>
      <p>
        You retain ownership of the information and records you enter (&ldquo;Your Content&rdquo;).
        You grant us only the limited permission needed to store, process, and display Your Content
        in order to provide the Service to you. We do not claim ownership of your records and do not
        use them to train advertising profiles. You are responsible for the accuracy of Your Content
        and for keeping your own copies of anything important to you.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or in violation of these Terms;</li>
        <li>Attempt to access accounts, data, or systems that are not yours;</li>
        <li>Interfere with, disrupt, or overload the Service or its infrastructure;</li>
        <li>Reverse engineer, scrape, or resell the Service except as permitted by law;</li>
        <li>Upload malicious code or content that infringes others&rsquo; rights.</li>
      </ul>

      <h2>6. Affiliate links &amp; advertising</h2>
      <p>
        The Service may display advertising and may include affiliate links, including as an Amazon
        Associate, which means we may earn a commission from qualifying purchases at no extra cost to
        you. Recommendations are provided for convenience and are not endorsements of any particular
        seller or product.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        The Service is provided <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong>
        without warranties of any kind, whether express or implied, including fitness for a
        particular purpose and non-infringement. We do not warrant that the Service will be
        uninterrupted, error-free, or that records and reports will meet any specific legal
        requirement. As noted above, the Service is not legal advice.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, HomeSchool Helper and its providers will not be
        liable for any indirect, incidental, special, consequential, or punitive damages, or for any
        loss of data, arising from your use of the Service. Our total liability for any claim
        relating to the Service will not exceed the amount you paid us in the twelve months before
        the claim.
      </p>

      <h2>9. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time. We may suspend or
        terminate access if you violate these Terms or to protect the Service or its users. On
        termination, your right to use the Service ends; sections that by their nature should survive
        (such as content ownership, disclaimers, and limitation of liability) will remain in effect.
      </p>

      <h2>10. Changes to the Service &amp; Terms</h2>
      <p>
        We may modify or discontinue features, and we may update these Terms from time to time. When
        we make material changes, we will update the &ldquo;Last updated&rdquo; date above. Your
        continued use of the Service after changes take effect means you accept the updated Terms.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Missouri, without regard to its
        conflict-of-laws rules. Any disputes will be resolved in the state or federal courts located
        in Missouri, unless otherwise required by applicable law.
      </p>

      <h2>12. Contact us</h2>
      <p>
        Questions about these Terms? Email us at{' '}
        <a href="mailto:hello@homeschoolhelper.com">hello@homeschoolhelper.com</a>.
      </p>
    </LegalDoc>
  )
}

export default TermsOfService
