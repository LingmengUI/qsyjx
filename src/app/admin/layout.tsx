"use client"

import { Sidebar } from "../../components/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:pl-64 pt-16">
        <div className="p-8 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-none">
          {children}
        </div>
      </main>
    </div>
  )
} 