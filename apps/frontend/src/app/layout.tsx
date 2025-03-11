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
  title: "Genius DEX - Trading Bot Platform",
  description: "Advanced trading bot platform with AI-powered strategies",
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
    <html lang="en" className="dark">
      <body className={inter.className}>
        <EnvVariables value={availableList}>
          <FetchProviderComponent>
            <UserWrapper>
              {children}
            </UserWrapper>
          </FetchProviderComponent>
        </EnvVariables>
      </body>
    </html>
  );
}
