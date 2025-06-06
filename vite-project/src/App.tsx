import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/chatpages/Layout';
import Home from './components/chatpages/Home';
import ChatPage from './components/chatpages/ChatPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="chats/:id" element={<ChatPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
