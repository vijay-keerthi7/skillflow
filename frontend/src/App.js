import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import UsersProvider from './context/UsersContext';
import Users from './components/Users';
import ChatDetail from './components/ChatDetail';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. PUBLIC: No wrapping here at all */}
        <Route path="/auth" element={<Auth />} />

  {/* Only accessible if ProtectedRoute returns children */}
  <Route 
    path="/" 
    element={
      <ProtectedRoute>
        <UsersProvider>
          <Users />
        </UsersProvider>
      </ProtectedRoute>
    } 
  >
    <Route path="chat/:id" element={<ChatDetail />} />
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;