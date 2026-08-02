import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ChatPage from './chat/ChatPage';
import EditorPage from './editor/EditorPage';
import PlainTextEmojiPage from './editor/PlainTextEmojiPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/plain-text-emojis" element={<PlainTextEmojiPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
