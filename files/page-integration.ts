// ─── CHANGES TO app/page.tsx ───────────────────────────────────────────────

// 1. Import the component at the top with your other imports:
import OnboardingModal from "@/components/OnboardingModal";

// 2. Add state inside GracefulFlow (alongside your existing useState calls):
const [showOnboarding, setShowOnboarding] = useState(true);

// 3. Wrap the return — replace the current return block:
return (
  <div className="relative">
    {showOnboarding && (
      <OnboardingModal onComplete={() => setShowOnboarding(false)} />
    )}
    {content}
    <TestDashboard onInject={injectScenario} />
  </div>
);

// That's it. The modal mounts on first render, dismisses on complete/skip,
// and the feed is fully accessible underneath once closed.
//
// If you want "show once per session", wrap the initial useState like this:
// const [showOnboarding, setShowOnboarding] = useState(() => {
//   if (typeof window === "undefined") return true;
//   return !sessionStorage.getItem("graceful_onboarded");
// });
// And in onComplete: sessionStorage.setItem("graceful_onboarded", "1"); setShowOnboarding(false);
