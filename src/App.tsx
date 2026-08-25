import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Landing } from "@/pages/landing";
import { Compare } from "@/pages/compare";

export default function App() {
  return (
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
  );
}
