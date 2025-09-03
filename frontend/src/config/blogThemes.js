// frontend/src/config/blogThemes.js
// ✅ FIXED: Use public directory paths instead of imports

export const blogThemes = {
  philosophy: {
    containerClass: 'philosophyPageContainer',
    backgroundColor: '#f9f7f4',
    
    headerConfig: {
      backgroundImage: '/assets/history-background.png', // ✅ Using existing as placeholder
      heroImage: '/assets/history-hero.png', // ✅ Using existing as placeholder
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
      backgroundImage: '/assets/Wrting-background.png', // ✅ Public path
      heroImage: '/assets/writings-hero.png', // ✅ Public path
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
      backgroundImage: '/assets/techbg.png', // ✅ Public path
      heroImage: '/assets/techhero.png', // ✅ Public path
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
      backgroundImage: '/assets/social-bg.jpg', // ✅ Public path
      heroImage: '/assets/social-hero.png', // ✅ Public path
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
      backgroundImage: '/assets/history-background.png', // ✅ Public path
      heroImage: '/assets/history-hero.png', // ✅ Public path
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
