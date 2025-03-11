"use client";

import { OnboardingForm } from "@frontend/components/onboarding/onboarding-form";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <OnboardingForm onComplete={handleComplete} />
      </div>
    </div>
  );
}
