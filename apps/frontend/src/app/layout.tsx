import { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { EnvVariables } from "@frontend/components/env.variables.context";
import { FetchProviderComponent } from "@frontend/hooks/use-fetch";
import { UserWrapper } from "@frontend/hooks/use-user";
import { Sidebar } from "@frontend/components/sidebar";
import { Header } from "@frontend/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Character Dashboard",
  description: "Generate and manage AI characters for social media",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const availableList = Object.entries(process.env).reduce((all, current) => {
    const [key, value] = current;

    return {
      ...all,
      ...(key.startsWith("NEXT_PUBLIC_") ? { [key]: value } : {}),
    };
  }, {});

  return (
    <html lang="en">
      <body className={inter.className}>
        <EnvVariables value={availableList}>
          <FetchProviderComponent>
            <UserWrapper>
              <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {children}
                  </main>
                </div>
              </div>
            </UserWrapper>
          </FetchProviderComponent>
        </EnvVariables>
      </body>
    </html>
  );
}
