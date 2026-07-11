import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StudentChatbot from "./StudentChatbot";

const Layout = ({ children, fullBleed = false }: { children: ReactNode; fullBleed?: boolean }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 ${fullBleed ? "" : "pt-[76px]"}`}>{children}</main>
      <Footer />
      <StudentChatbot />
    </div>
  );
};

export default Layout;
