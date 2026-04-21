import { LegalPage } from "../components/legal/LegalPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updatedAt="April 21, 2026"
      intro="This policy explains what information InvoiceFlow stores, how it is used, and what choices you have."
      sections={[
        {
          title: "Information we collect",
          body: [
            "We collect the details you enter into your account, including your name, email address, login credentials, customers, invoices, and notes you add in the app.",
            "We may also store basic technical information needed to keep you signed in and to operate the service reliably.",
          ],
        },
        {
          title: "How we use information",
          body: [
            "Your information is used to authenticate you, save your invoices and customers, and display your dashboard data.",
            "We may also use data to improve the product, troubleshoot issues, and keep the service secure.",
          ],
        },
        {
          title: "Sharing and retention",
          body: [
            "We do not sell your personal information. Data may be shared only when needed to provide the service or comply with legal obligations.",
            "We retain your data while your account is active or as needed to provide the service, unless deletion is requested or required by law.",
          ],
        },
        {
          title: "Your choices",
          body: [
            "You can update your account information through the app and contact us at appiahasantewaa7@gmail.com if you want help with data removal or access requests.",
          ],
        },
      ]}
    />
  );
}
