import Link from "next/link";
import { Leaf } from "lucide-react";

const pillars = [
  {
    emoji: "🙏",
    title: "A prayer would be nice",
    body: "Share what you're carrying. Let others lift it with you — anonymously.",
  },
  {
    emoji: "🤍",
    title: "Just sharing",
    body: "Sometimes you need to say it out loud before you know what to do with it.",
  },
  {
    emoji: "🌿",
    title: "A step toward something more",
    body: "GraceFul is a doorway, not a destination. Real community is still the goal.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--ink)]">
      <header className="sticky top-0 z-20 border-b border-[#d4e4cc] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-[var(--brand)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)]">
              <Leaf className="h-4.5 w-4.5" />
            </span>
            <span className="font-serif text-2xl font-bold text-[#2c3a2e]">
              GraceFul
            </span>
          </div>

          <Link
            href="/feed"
            className="inline-flex h-12 items-center justify-center rounded-[0.95rem] bg-[var(--brand)] px-6 text-[0.98rem] font-semibold text-white transition-colors hover:bg-[var(--brand-dark)]"
          >
            Enter the space
          </Link>
        </div>
      </header>

      <section className="bg-[#f5f7f2]">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--muted-ink)]">
            Anonymous sharing & prayer
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[0.98] tracking-[-0.05em] text-[#2c3a2e] sm:text-5xl md:text-6xl">
            A place to be honest
            <br />
            before you&apos;re ready
            <br />
            to be seen.
          </h1>
          <p className="mt-6 max-w-md text-[1rem] leading-8 text-[var(--muted-ink)] sm:text-[1.05rem]">
            GraceFul is not a replacement for community. It&apos;s a doorway into
            it — for those still finding their way to the front.
          </p>
          <Link
            href="/feed"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-[0.95rem] bg-[var(--brand)] px-6 text-[0.98rem] font-semibold text-white transition-colors hover:bg-[var(--brand-dark)]"
          >
            Find your footing →
          </Link>
        </div>
      </section>

      <section className="bg-[var(--page-bg)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article
                key={pillar.title}
                className="w-full rounded-[1.45rem] border border-[var(--card-border)] bg-white p-6 shadow-[0_8px_24px_rgba(57,84,61,0.04)] sm:p-7"
              >
                <div className="text-3xl">{pillar.emoji}</div>
                <h2 className="mt-5 text-2xl font-semibold leading-tight text-[var(--ink)]">
                  {pillar.title}
                </h2>
                <p className="mt-3 text-[1rem] leading-8 text-[var(--muted-ink)]">
                  {pillar.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--muted-ink)]">
            Is vulnerability only valid when visible?
          </p>
          <p className="mx-auto mt-5 max-w-lg text-[1.05rem] leading-8 text-[var(--muted-ink)]">
            We don&apos;t think so. Humility can look like stepping forward
            publicly — or quietly admitting you need help before you&apos;re ready
            to say it out loud.
          </p>
        </div>
      </section>

      <section className="bg-[#2c3a2e]">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <h2 className="text-3xl font-bold leading-tight tracking-[-0.03em] text-white sm:text-4xl">
            You don&apos;t have to have it together.
          </h2>
          <p className="mt-4 max-w-xl text-[1.02rem] leading-8 text-white/78">
            GraceFul is open. Anonymous. And waiting.
          </p>
          <Link
            href="/feed"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-[0.95rem] bg-white px-6 text-[0.98rem] font-semibold text-[#2c3a2e] transition-colors hover:bg-[var(--brand-soft)]"
          >
            Find your footing →
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[var(--brand-dark)]">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center text-sm text-white/65 sm:px-6 lg:px-8">
          GraceFul · Anonymous sharing & prayer
        </div>
      </footer>
    </main>
  );
}
