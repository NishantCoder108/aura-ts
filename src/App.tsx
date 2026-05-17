import { Route, Routes } from "react-router";

import Login from "@/components/auth/Login";
import Signup from "@/components/auth/Signup";
import { GuestRoute, ProtectedRoute } from "@/components/layout/RouteGuards";
import { AuthProvider } from "@/context/AuthContext";
import Home from "@/pages/Home";
import NotFound from "@/pages/Notfound";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
