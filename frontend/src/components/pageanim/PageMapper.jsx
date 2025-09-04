// frontend/src/components/pageanim/PageMapper.jsx
import HomePage from '../../pages/HomePage';
import UniformPage from '../../pages/UniformPages/UniformPage';
import DailythoughtsReader from '../../pages/DailythoughtsPage/DailythoughtsReader';
import AdminLogin from '../../pages/AdminPage/AdminLogin';


const getPageComponent = (path) => {
  switch (path) {
    case '/': return <HomePage />;
    case '/philosophy':
    case '/history':
    case '/writings':
    case '/legal-social':
    case '/tech':
      return <UniformPage />;
    case '/daily-thoughts': return <DailythoughtsReader />;
    case '/admin/login': return <AdminLogin />;
    default: return null;
  }
};

export default getPageComponent;
