"use client";

import { OnboardingForm } from "@frontend/components/onboarding/onboarding-form";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();
    
    const handleComplete = () => {
        // Redirect to dashboard after completion
        router.push("/characters");
    };
    
    return <OnboardingForm onComplete={handleComplete} />;
}