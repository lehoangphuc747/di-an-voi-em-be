import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SessionContextProvider } from '@/components/SessionContextProvider';
import { Layout } from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import DetailPage from '@/pages/DetailPage';
import LoginPage from '@/pages/LoginPage';
import FavoritesPage from '@/pages/FavoritesPage';
import WishlistPage from '@/pages/WishlistPage';
import VisitedPage from '@/pages/VisitedPage';
import ProfilePage from '@/pages/ProfilePage';
import SubmitFoodPage from '@/pages/SubmitFoodPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { CodebaseProvider } from '@/contexts/CodebaseContext';

function App() {
  return (
    <CodebaseProvider>
      <SessionContextProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mon/:id" element={<DetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/visited" element={<VisitedPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/submit-food" element={<SubmitFoodPage />} />
              <Route path="/submit-food/:id/edit" element={<SubmitFoodPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
          <Toaster richColors />
        </Router>
      </SessionContextProvider>
    </CodebaseProvider>
  );
}

export default App;