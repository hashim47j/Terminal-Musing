// frontend/src/config/blogThemes.js
import writingsHero from '../assets/writings-hero.png';
import writingsBackground from '../assets/Wrting-background.png';
import techHero from '../assets/techhero.png';
import techBackground from '../assets/techbg.png';
import socialHero from '../assets/social-hero.png';
import socialBackground from '../assets/social-bg.jpg';
import historyHero from '../assets/history-hero.png';
import historyBackground from '../assets/history-background.png';
import PhilosophyHero from '../assets/kant-sapere-aude.png';
import PhilosophyBackground from '../assets/philosophy-background.png'

export const BLOG_THEMES = {
  writings: {
    backgroundColor: '#f7eedb',
    containerClass: 'writingsPageContainer',
    headerConfig: {
      backgroundImage: writingsBackground,
      heroImage: writingsHero,
      altText: 'Writings Hero',
      heroPosition: { x: 0, y: 25 },
      heroWidth: 180,
      mobileHeroPosition: { x: 4, y: 15 },
      mobileHeroWidth: 160
    },
    postsSection: {
      backgroundColor: '#ffffff77',
      heading: 'Writings',
      loadingText: 'Loading writings...',
      emptyStateTitle: 'No Writings Available',
      emptyStateText: 'Check back soon.'
    },
    cardStyle: {
      backgroundColor: '#ffffff85'
    },
    stripColor: '#d1c1a0',
    apiEndpoint: '/api/blogs/writings',
    routeBase: '/blog/writings'
  },
  
  tech: {
    backgroundColor: '#e4e7eb',
    containerClass: 'techPageContainer',
    headerConfig: {
      backgroundImage: techBackground,
      heroImage: techHero,
      altText: 'Tech Hero',
      heroPosition: { x: 0, y: 15 },
      heroWidth: 300,
      mobileHeroPosition: { x: 30, y: 15 },
      mobileHeroWidth: 180
    },
    postsSection: {
      backgroundColor: '#ffffff6e',
      heading: 'Tech Posts',
      loadingText: 'Loading tech posts...',
      emptyStateTitle: 'No Tech Posts Available',
      emptyStateText: 'Check back soon for new technology insights and articles.'
    },
    cardStyle: {
      backgroundColor: '#fff'
    },
    stripColor: '#86859a',
    apiEndpoint: '/api/blogs/tech',
    routeBase: '/blog/tech'
  },
  
  lsconcern: {
    backgroundColor: '#dddbd8',
    containerClass: 'lsconcernPageContainer',
    headerConfig: {
      backgroundImage: socialBackground,
      heroImage: socialHero,
      altText: 'Legal & Social Hero',
      heroPosition: { x: 0, y: 25 },
      heroWidth: 280,
      mobileHeroPosition: { x: 25, y: 20 },
      mobileHeroWidth: 170
    },
    postsSection: {
      backgroundColor: '#ffffff6b',
      heading: 'Legal & Social Posts',
      loadingText: 'Loading Legal & Social posts...',
      emptyStateTitle: 'No Legal & Social Posts Available',
      emptyStateText: 'Check back soon for new legal insights and social commentary.'
    },
    cardStyle: {
      backgroundColor: '#ffffff94'
    },
    stripColor: '#a19d95',
    apiEndpoint: '/api/blogs/lsconcern',
    routeBase: '/blog/lsconcern'
  },
  
  history: {
    backgroundColor: '#E4E4E4',
    containerClass: 'historyPageContainer',
    headerConfig: {
      backgroundImage: historyBackground,
      heroImage: historyHero,
      altText: 'Historical Illustration',
      heroPosition: { x: 0, y: 4 },
      heroWidth: 160,
      mobileHeroPosition: { x: 7.5, y: 15 },
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
      backgroundColor: '#fff'
    },
    stripColor: '#929292',
    apiEndpoint: '/api/blogs/history',
    routeBase: '/blog/history'
  },
  
  philosophy: {
    backgroundColor: '#f5f5f0',
    containerClass: 'philosophyPageContainer',
    headerConfig: {
      backgroundImage: PhilosophyBackground, 
      heroImage: PhilosophyHero, 
      altText: 'Philosophy Hero',
      heroPosition: { x: 0, y: 25 },
      heroWidth: 230,
      mobileHeroPosition: { x: 8, y: 12 },
      mobileHeroWidth: 150
    },
    postsSection: {
      backgroundColor: '#ffffff80',
      heading: 'Philosophy Posts',
      loadingText: 'Loading philosophy posts...',
      emptyStateTitle: 'No Philosophy Posts Available',
      emptyStateText: 'Check back soon for new philosophical insights and discussions.'
    },
    cardStyle: {
      backgroundColor: '#fff'
    },
    stripColor: '#d3c9af',
    apiEndpoint: '/api/blogs/philosophy',
    routeBase: '/blog/philosophy'
  }
};

export const getThemeByCategory = (category) => {
  return BLOG_THEMES[category] || BLOG_THEMES.writings;
};

export const getCategoryFromPath = (pathname) => {
  if (pathname.includes('/blog/')) {
    const match = pathname.match(/\/blog\/([^\/]+)/);
    return match ? match[1] : 'writings';
  }
  
  // Handle direct paths for compatibility
  const pathMap = {
    '/philosophy': 'philosophy',
    '/history': 'history',
    '/tech': 'tech',
    '/legal-social': 'lsconcern',
    '/writings': 'writings'
  };
  
  return pathMap[pathname] || 'writings';
};

