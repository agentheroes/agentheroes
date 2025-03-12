import { ReactNode } from "react";
import "./globals.css";
import localFont from "next/font/local";
import { EnvVariables } from "@frontend/components/env.variables.context";
import { FetchProviderComponent } from "@frontend/hooks/use-fetch";
import { UserWrapper } from "@frontend/hooks/use-user";

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/inter/Inter-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
});

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
