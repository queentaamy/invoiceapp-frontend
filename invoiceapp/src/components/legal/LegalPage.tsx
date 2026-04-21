import { Link } from "react-router-dom";
import { AppLogo } from "../ui/AppLogo";

interface LegalSection {
  title: string;
  body: string[];
}

interface LegalPageProps {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({
  title,
  updatedAt,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-surface-muted px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <AppLogo size={32} />
          <div>
            <p className="text-sm font-semibold text-ink-900">InvoiceFlow</p>
            <p className="text-xs text-ink-400">Billing Suite</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
          <Link
            to="/signup"
            className="inline-flex items-center text-sm font-medium text-[#2B31E9] hover:text-[#1d229f]"
          >
            Back to signup
          </Link>

          <div className="mt-5 border-b border-ink-100 pb-5">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-400">
              Last updated {updatedAt}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-ink-500 sm:text-base">
              {intro}
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold text-ink-900">
                  {section.title}
                </h2>
                <div className="mt-2 space-y-3 text-sm leading-6 text-ink-600 sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
