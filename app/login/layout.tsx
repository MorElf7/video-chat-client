"use client"

import Navbar from "../components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {

	return (
		<div className="flex flex-col h-screen">
			<Navbar handleActiveRoom={(s: string) => {}}/>
			{children}
		</div>
	);
}
