import type React from "react";
import { Header } from "@frontend/components/header";
import { ViewasComponent } from "@frontend/components/viewas/viewas.component";

export const metadata = {
  title: "Agent Heroes",
  description: "Generate and manage AI characters for social media",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <ViewasComponent />
      <Header />
      <div className="px-4 py-8 w-full flex-1 h-full">
        <div className="flex w-full min-h-full">{children}</div>
      </div>
    </div>
  );
}
