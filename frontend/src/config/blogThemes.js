// frontend/src/config/blogThemes.js
// ✅ FIXED: Use direct static imports instead of dynamic imports

// Import all images at the top
import writingsBackground from '../../assets/Wrting-background.png';
import writingsHero from '../../assets/writings-hero.png';
import techBackground from '../../assets/techbg.png';
import techHero from '../../assets/techhero.png';
import socialBackground from '../../assets/social-bg.jpg';
import socialHero from '../../assets/social-hero.png';
import historyBackground from '../../assets/history-background.png';
import historyHero from '../../assets/history-hero.png';

// ⚠️ ADD THESE ASSETS (you need to create/find these)
// For now, let's use placeholders or existing ones
import philosophyBackground from '../../assets/history-background.png'; // Placeholder - replace with actual
import philosophyHero from '../../assets/history-hero.png'; // Placeholder - replace with actual

export const blogThemes = {
  philosophy: {
    containerClass: 'philosophyPageContainer',
    backgroundColor: '#f9f7f4',
    
    headerConfig: {
      backgroundImage: philosophyBackground, // ✅ Direct reference
      heroImage: philosophyHero, // ✅ Direct reference
      heroPosition: { x: -45, y: 8 },
      heroWidth: 180,
      altText: 'Philosophy'
    },
    
    postsSection: {
      backgroundColor: '#ffffff85',
      heading: 'Philosophy Posts',
      loadingText: 'Loading philosophy posts...',
      emptyStateTitle: 'No Philosophy Posts Available',
      emptyStateText: 'Check back soon for new philosophical insights and discussions.'
    },
    
    cardStyle: {
      backgroundColor: '#ffffff90',
    },
    
    stripColor: '#d4c5a9',
    apiEndpoint: '/api/blogs/philosophy',
    routeBase: '/blog/philosophy'
  },

  writings: {
    containerClass: 'writingsPageContainer', 
    backgroundColor: '#f7eedb',
    
    headerConfig: {
      backgroundImage: writingsBackground, // ✅ Direct reference
      heroImage: writingsHero, // ✅ Direct reference
      heroPosition: { x: -45, y: 8 },
      heroWidth: 180,
      altText: 'Writings Hero'
    },
    
    postsSection: {
      backgroundColor: '#ffffff77',
      heading: 'Writings',
      loadingText: 'Loading writings...',
      emptyStateTitle: 'No Writings Available',
      emptyStateText: 'Check back soon for new poems, stories, and creative works.'
    },
    
    cardStyle: {
      backgroundColor: '#ffffff85',
    },
    
    stripColor: '#d1c1a0',
    apiEndpoint: '/api/blogs/writings',
    routeBase: '/blog/writings'
  },

  tech: {
    containerClass: 'techPageContainer',
    backgroundColor: '#e4e7eb',
    
    headerConfig: {
      backgroundImage: techBackground, // ✅ Direct reference
      heroImage: techHero, // ✅ Direct reference
      heroPosition: { x: 0, y: 25 },
      heroWidth: 300,
      altText: 'Tech Hero'
    },
    
    postsSection: {
      backgroundColor: '#ffffff6e',
      heading: 'Tech Posts',
      loadingText: 'Loading tech posts...',
      emptyStateTitle: 'No Tech Posts Available',
      emptyStateText: 'Check back soon for new technology insights and articles.'
    },
    
    cardStyle: {
      backgroundColor: '#fff',
    },
    
    stripColor: '#86859a',
    apiEndpoint: '/api/blogs/tech',
    routeBase: '/blog/tech'
  },

  lsconcern: {
    containerClass: 'lsconcernPageContainer',
    backgroundColor: '#dddbd8',
    
    headerConfig: {
      backgroundImage: socialBackground, // ✅ Direct reference
      heroImage: socialHero, // ✅ Direct reference
      heroPosition: { x: 0, y: 25 },
      heroWidth: 280,
      altText: 'Legal & Social Hero',
      mobileHeroPosition: { x: 25, y: 20 },
      mobileHeroWidth: 200
    },
    
    postsSection: {
      backgroundColor: '#ffffff6b',
      heading: 'Legal & Social Posts',
      loadingText: 'Loading Legal & Social posts...',
      emptyStateTitle: 'No Legal & Social Posts Available',
      emptyStateText: 'Check back soon for new legal insights and social commentary.'
    },
    
    cardStyle: {
      backgroundColor: '#ffffff94',
    },
    
    stripColor: '#a19d95',
    apiEndpoint: '/api/blogs/lsconcern',
    routeBase: '/blog/lsconcern'
  },

  history: {
    containerClass: 'historyPageContainer',
    backgroundColor: '#E4E4E4',
    
    headerConfig: {
      backgroundImage: historyBackground, // ✅ Direct reference
      heroImage: historyHero, // ✅ Direct reference
      heroPosition: { x: -45, y: 8 },
      heroWidth: 160,
      altText: 'Historical Illustration',
      mobileHeroWidth: 120
    },
    
    postsSection: {
      backgroundColor: '#ecebeb',
      heading: 'History Posts', 
      loadingText: 'Loading history posts...',
      emptyStateTitle: 'No History Posts Available',
      emptyStateText: 'Check back soon for new historical insights and articles.'
    },
    
    cardStyle: {
      backgroundColor: '#fff',
    },
    
    stripColor: '#929292',
    apiEndpoint: '/api/blogs/history',
    routeBase: '/blog/history'
  }
};

export const getThemeByCategory = (category) => {
  return blogThemes[category] || blogThemes.philosophy;
};

export const getCategoryFromPath = (pathname) => {
  const match = pathname.match(/\/blog\/([^\/]+)/);
  return match ? match[1] : 'philosophy';
};
