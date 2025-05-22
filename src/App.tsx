import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import EventDetail from "@/pages/EventDetail";
import Categories from "@/pages/Categories";
import { createContext, useState } from "react";
import { CalendarProvider } from "@/contexts/CalendarContext";

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => {},
  logout: () => {},
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <CalendarProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/new" element={<div className="text-center text-xl">Event Create - Coming Soon</div>} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </CalendarProvider>
    </AuthContext.Provider>
  );
}
