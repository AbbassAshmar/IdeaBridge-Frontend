import Navbar from "./Navbar";

function AuthLayout({ children }) {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(800px_500px_at_10%_5%,rgba(59,130,246,0.20),transparent_60%),radial-gradient(700px_450px_at_90%_95%,rgba(14,165,233,0.14),transparent_65%),linear-gradient(180deg,#070a11_0%,#06080d_100%)]" />
      <Navbar />
      <main className="grid min-h-[calc(100vh-88px)] place-items-center px-4 pb-6 pt-8 md:min-h-[calc(100vh-84px)]">
        {children}
      </main>
    </>
  );
}

export default AuthLayout;
