import { useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Landing } from "@/pages/landing";
import { Compare } from "@/pages/compare";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
              <Navbar />
              <main className="flex-1">
                <Landing />
              </main>
              <Footer />
            </div>
          }
        />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </>
  );
}
