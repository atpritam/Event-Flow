export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-dotted-pattern bg-primary-50 bg-cover bg-fixed">
      {children}
    </div>
  );
}
