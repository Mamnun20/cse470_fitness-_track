import type { Metadata } from "next";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import ToastClient from "../component/ToastClient";

export const metadata: Metadata = {
  title: "Fitness Track Admin",
  description: "Admin dashboard for FitnessFreak",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastClient />
      </body>
    </html>
  );
}
