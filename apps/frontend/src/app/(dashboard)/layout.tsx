import type React from "react";
import { Header } from "@frontend/components/header";
import { PostDialogProvider } from "@frontend/components/post";

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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto px-4 py-8">
        <main>{children}</main>
      </div>
    </div>
  );
}
