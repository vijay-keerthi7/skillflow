
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import UsersProvider from './context/UsersContext';
import Users from './components/Users';
import ChatDetail from './components/ChatDetail';
function App() {
  return (
    <BrowserRouter>
      {/* Wrap everything in the Provider so both Users and ChatDetail can see the data */}
      <UsersProvider>
        <Routes>
          {/* Main Route */}
          <Route path="/" element={<Users />}>
            {/* Child Route: This will be rendered inside the <Outlet /> in Users.jsx */}
            <Route path="chat/:id" element={<ChatDetail />} />
          </Route>
        </Routes>
      </UsersProvider>
    </BrowserRouter>
  );
}

export default App;
