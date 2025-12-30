
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import UsersProvider from './context/UsersContext';
import Users from './components/Users';
import ChatDetail from './components/ChatDetail';
import Auth from './components/Auth';
function App() {
  return (
    <BrowserRouter>
      {/* Wrap everything in the Provider so both Users and ChatDetail can see the data */}
      <UsersProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Users />}>
            <Route path="chat/:id" element={<ChatDetail />} />
          </Route>
        </Routes>
      </UsersProvider>
    </BrowserRouter>
  );
}

export default App;
