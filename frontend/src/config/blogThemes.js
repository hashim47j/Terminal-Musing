// frontend/src/config/blogThemes.js
// Configuration for different blog page themes

export const blogThemes = {
    philosophy: {
      // Container and layout
      containerClass: 'philosophyPageContainer',
      backgroundColor: '#f9f7f4',
      
      // Header configuration  
      headerConfig: {
        // ✅ FIXED: Using the actual philosophy background asset from your code
        backgroundImage: () => import('../../assets/philosophy-background.png'), 
        heroImage: () => import('../../assets/kant-sapere-aude.png'),
        heroPosition: { x: -45, y: 8 },
        heroWidth: 180,
        altText: 'Philosophy'
      },
      
      // Content section styling
      postsSection: {
        backgroundColor: '#ffffff85',
        heading: 'Philosophy Posts',
        loadingText: 'Loading philosophy posts...',
        emptyStateTitle: 'No Philosophy Posts Available',
        emptyStateText: 'Check back soon for new philosophical insights and discussions.'
      },
      
      // Card styling
      cardStyle: {
        backgroundColor: '#ffffff90',
      },
      
      // Footer strip color
      stripColor: '#d4c5a9',
      
      // API endpoint
      apiEndpoint: '/api/blogs/philosophy',
      
      // Route base
      routeBase: '/blog/philosophy'
    },
  
    writings: {
      containerClass: 'writingsPageContainer', 
      backgroundColor: '#f7eedb',
      
      headerConfig: {
        backgroundImage: () => import('../../assets/Wrting-background.png'),
        heroImage: () => import('../../assets/writings-hero.png'),
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
        backgroundImage: () => import('../../assets/techbg.png'),
        heroImage: () => import('../../assets/techhero.png'),
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
        backgroundImage: () => import('../../assets/social-bg.jpg'),
        heroImage: () => import('../../assets/social-hero.png'),
        heroPosition: { x: 0, y: 25 },
        heroWidth: 280,
        altText: 'Legal & Social Hero',
        mobileHeroPosition: { x: 25, y: 20 }, // Special mobile positioning
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
        backgroundImage: () => import('../../assets/history-background.png'),
        heroImage: () => import('../../assets/history-hero.png'),
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
  
  // Helper function to get theme by category
  export const getThemeByCategory = (category) => {
    return blogThemes[category] || blogThemes.philosophy; // Default fallback
  };
  
  // Helper to get category from pathname
  export const getCategoryFromPath = (pathname) => {
    const match = pathname.match(/\/blog\/([^\/]+)/);
    return match ? match[1] : 'philosophy';
  };
  