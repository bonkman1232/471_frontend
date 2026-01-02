import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AppContent from "./components/AppContent";
import Login from "./pages/Login";
import Register from "./pages/Register";

export type UserRole = 'student' | 'faculty' | 'admin' | 'supervisor' | string;
export type PageView = string;
export type Reservation = any;
export type Criterion = any;
export type Evaluation = { criteria: Criterion[]; [k: string]: any };
export type EvaluationStatus = string | number;
export type AssessorRole = string;
export type Faculty = any;
export type Location = any;
export type Project = { id?: string; title?: string; studentId?: string; studentName?: string; department?: string; [k: string]: any };
export type ProjectWithStatus = Project & { status?: string };

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;