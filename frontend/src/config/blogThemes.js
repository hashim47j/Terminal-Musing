// frontend/src/config/blogThemes.js

export const blogThemes = {
  writings: {
    containerClass: 'writingsPageContainer',
    backgroundColor: '#f7eedb',
    headerConfig: {
      backgroundImage: '/Wrting-background.png', // ✅ Public path
      heroImage: '/writings-hero.png', // ✅ Public path
      altText: 'Writings Hero',
      heroPosition: { x: -45, y: 8 },
      heroWidth: 180
    },
    postsSection: {
      backgroundColor: '#ffffff77',
      heading: 'Writings',
      loadingText: 'Loading writings...',
      emptyStateTitle: 'No Writings Available',
      emptyStateText: 'Check back soon for new poems, stories, and creative works.'
    },
    cardStyle: {
      backgroundColor: '#ffffff85'
    },
    stripColor: '#d1c1a0',
    apiEndpoint: '/api/blogs/writings',
    routeBase: '/blog/writings'
  },
  
  tech: {
    containerClass: 'techPageContainer',
    backgroundColor: '#e4e7eb',
    headerConfig: {
      backgroundImage: '/techbg.png', // ✅ Public path
      heroImage: '/techhero.png', // ✅ Public path
      altText: 'Tech Hero',
      heroPosition: { x: 0, y: 25 },
      heroWidth: 300
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
    containerClass: 'lsconcernPageContainer',
    backgroundColor: '#dddbd8',
    headerConfig: {
      backgroundImage: '/social-bg.jpg', // ✅ Public path
      heroImage: '/social-hero.png', // ✅ Public path
      altText: 'Legal & Social Hero',
      heroPosition: { x: 0, y: 25 },
      heroWidth: 280
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
    containerClass: 'historyPageContainer',
    backgroundColor: '#E4E4E4',
    headerConfig: {
      backgroundImage: '/history-background.png', // ✅ Public path
      heroImage: '/history-hero.png', // ✅ Public path
      altText: 'Historical Illustration',
      heroPosition: { x: -45, y: 8 },
      heroWidth: 160
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
    containerClass: 'philosophyPageContainer',
    backgroundColor: '#f0f0f0',
    headerConfig: {
      backgroundImage: '/philosophy-background.png', // ✅ Public path (create/copy from history)
      heroImage: '/kant-sapere-aude.png', // ✅ Public path
      altText: 'Philosophy Hero',
      heroPosition: { x: 0, y: 20 },
      heroWidth: 200
    },
    postsSection: {
      backgroundColor: '#ffffff',
      heading: 'Philosophy Posts',
      loadingText: 'Loading philosophy posts...',
      emptyStateTitle: 'No Philosophy Posts Available',
      emptyStateText: 'Check back soon for new philosophical insights and discussions.'
    },
    cardStyle: {
      backgroundColor: '#fff'
    },
    stripColor: '#cccccc',
    apiEndpoint: '/api/blogs/philosophy',
    routeBase: '/blog/philosophy'
  }
};

export const getCategoryFromPath = (pathname) => {
  if (pathname.includes('/writings')) return 'writings';
  if (pathname.includes('/tech')) return 'tech';
  if (pathname.includes('/lsconcern')) return 'lsconcern';
  if (pathname.includes('/history')) return 'history';
  if (pathname.includes('/philosophy')) return 'philosophy';
  return 'writings'; // default fallback
};

export const getThemeByCategory = (category) => {
  return blogThemes[category] || blogThemes.writings;
};
