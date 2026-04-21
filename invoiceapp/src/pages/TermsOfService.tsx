import { LegalPage } from "../components/legal/LegalPage";

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      updatedAt="April 21, 2026"
      intro="These terms describe how you can use InvoiceFlow and what you can expect from the service."
      sections={[
        {
          title: "Using InvoiceFlow",
          body: [
            "You may use InvoiceFlow to create, manage, and track invoices and customer records for your business.",
            "You are responsible for keeping your account credentials secure and for any activity that happens under your account.",
          ],
        },
        {
          title: "Acceptable use",
          body: [
            "Do not attempt to misuse, disrupt, reverse engineer, or access parts of the service that are not intended for you.",
            "You agree to provide accurate information when creating an account and when entering invoice or customer data.",
          ],
        },
        {
          title: "Service availability",
          body: [
            "We aim to keep the service available, but uptime is not guaranteed and features may change over time.",
            "We may update or suspend parts of the service when needed for maintenance, security, or product improvements.",
          ],
        },
        {
          title: "Contact",
          body: [
            "If you have questions about these terms, contact us at appiahasantewaa7@gmail.com.",
          ],
        },
      ]}
    />
  );
}
