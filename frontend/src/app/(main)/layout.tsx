import Navbar from "@/components/shared/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />
      
      {/* 
        On mobile, we add pb-24 to ensure content isn't hidden behind the fixed bottom tab bar.
        On desktop (md), we remove it because the top navbar doesn't cover content.
      */}
      <main className="flex-1 pb-24 md:pb-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {children}
      </main>
    </div>
  );
}