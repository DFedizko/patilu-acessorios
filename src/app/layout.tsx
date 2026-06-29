import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import "@/app/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Providers } from "@/app/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/feedback/toaster";

const baloo = Baloo_2({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    variable: "--font-baloo",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-inter",
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
        <html lang="pt-BR">
            <body className={`${baloo.variable} ${inter.variable} font-sans text-ink antialiased`}>
                <ClerkProvider>
                    <Providers>
                        <div className="flex min-h-screen app-bg">
                            {userId && <Sidebar />}
                            <main className="min-w-0 flex-1 px-7.5 pt-7 pb-10">{children}</main>
                            <Toaster />
                        </div>
                    </Providers>
                </ClerkProvider>
            </body>
        </html>
    );
}
