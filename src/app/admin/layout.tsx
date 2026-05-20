import React from "react";

export const metadata = {
  title: "Admin Panel | RT RW App",
  description: "Dashboard Administrasi Lingkungan",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col lg:flex-row bg-slate-50">
      {children}
    </div>
  );
}
