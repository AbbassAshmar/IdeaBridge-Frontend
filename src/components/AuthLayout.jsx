import Navbar from "./Navbar";

function AuthLayout({ children }) {
  return (
    <>
      <div className="page-bg" />
      <Navbar />
      <main className="grid min-h-[calc(100vh-77px)] place-items-center px-4 pb-6 pt-8">
        {children}
      </main>
    </>
  );
}

export default AuthLayout;
