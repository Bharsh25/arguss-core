import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import TeacherAuth from './pages/TeacherAuth.jsx'
import StudentAuth from './pages/StudentAuth.jsx'
import TeacherDashboard from './pages/TeacherDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import JoinResolver from './pages/JoinResolver.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/teacher" element={<TeacherAuth />} />
      <Route path="/student" element={<StudentAuth />} />
      <Route path="/join/:inviteCode" element={<JoinResolver />} />
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}