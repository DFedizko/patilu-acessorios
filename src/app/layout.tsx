import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@themes/orchid-theme.css";
import "@/app/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Providers } from "@/app/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/feedback/toaster";

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

export const metadata: Metadata = {
    title: "Patilu Acessórios",
    description: "Empacotamento e margem para lives",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { userId } = await auth();
    return (
        <html lang="pt-BR" data-theme="orchid">
            <body
                className={`${geistSans.variable} ${geistMono.variable} bg-background font-sans text-ink antialiased`}
            >
                <ClerkProvider>
                    <Providers>
                        {userId ? (
                            <div className="flex min-h-svh">
                                <Sidebar />
                                <div className="flex h-svh min-w-0 flex-1 flex-col p-2 pl-0 print:h-auto print:p-0">
                                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xs print:overflow-visible print:rounded-none print:border-none print:shadow-none">
                                        {children}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <main className="flex min-h-svh">{children}</main>
                        )}
                        <Toaster />
                    </Providers>
                </ClerkProvider>
            </body>
        </html>
    );
}
