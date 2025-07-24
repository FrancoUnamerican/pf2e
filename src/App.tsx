import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/Layout';
import { PlayerPage } from './pages/PlayerPage';
import { GMPage } from './pages/GMPage';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<PlayerPage />} />
            <Route path="/player" element={<PlayerPage />} />
            <Route path="/gm" element={<GMPage />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App
