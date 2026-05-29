import { Routes, Route } from "react-router";
import { PageTransition } from "@/components/layout/PageTransition";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Shop from "./pages/Shop";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import HowToPlay from "./pages/HowToPlay";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Help from "./pages/Help";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Game />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/help" element={<Help />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
}
