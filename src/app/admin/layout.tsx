export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr" lang="en" className="min-h-screen bg-[#0b0b0b] text-foreground">
      {children}
    </div>
  );
}
