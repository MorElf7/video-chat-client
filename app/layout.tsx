import AuthenticationProvider from "@/components/AuthenticationProvider";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
	title: "VC",
	viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body suppressHydrationWarning={true} className={inter.className}>
				<AuthenticationProvider>
					<div className="flex flex-col h-screen">{children}</div>
				</AuthenticationProvider>
			</body>
		</html>
	);
}
