import HomePage from '../../pages/HomePage';
import PhilosophyPage from '../../pages/PhilosophyPage';
import HistoryPage from '../../pages/HistoryPage/HistoryPage';
import WritingsPage from '../../pages/WritingsPage/WritingsPage';
import LsconcernPage from '../../pages/LsconcernPage/LsconcernPage';
import TechPage from '../../pages/TechPage/TechPage';
import DailythoughtsReader from '../../pages/DailythoughtsPage/DailythoughtsReader';
import AdminLogin from '../../pages/AdminPage/AdminLogin';

const getPageComponent = (path) => {
  switch (path) {
    case '/': return <HomePage />;
    case '/philosophy': return <PhilosophyPage />;
    case '/history': return <HistoryPage />;
    case '/writings': return <WritingsPage />;
    case '/legal-social': return <LsconcernPage />;
    case '/tech': return <TechPage />;
    case '/daily-thoughts': return <DailythoughtsReader />;
    case '/admin/login': return <AdminLogin />;
    default: return null;
  }
};

export default getPageComponent;
