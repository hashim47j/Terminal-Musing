// Theme configurations for different blog categories
export const blogThemes = {
    philosophy: {
      name: 'Philosophy Posts',
      apiEndpoint: '/api/blogs/philosophy',
      routePath: '/blog/philosophy',
      loadingText: 'Loading philosophy posts...',
      emptyStateText: 'Check back soon for new philosophical insights and articles.',
      errorPrefix: 'philosophy',
      
      // Assets
      heroImage: () => import('../../assets/kant-sapere-aude.png'),
      heroDarkImage: () => import('../../assets/kant-sapere-aude-dark.png'),
      backgroundImage: () => import('../../assets/philosophy-background.png'),
      
      // Styling
      containerClass: 'philosophyPageContainer',
      heroImageClass: 'kantSapereAudeImage',
      heroPositioning: {
        desktop: { x: '0px', y: '25px' },
        mobile: { x: '20px', y: '30px' }
      },
      
      // Colors & Backgrounds
      pageBackground: '#f4f0e8',
      sectionBackground: '#ffffff60',
      cardBackground: '#ffffff80',
      stripBackground: '#e4d7be',
      mobileHeadingBackground: '#ecebeb',
      
      // Special features
      supportsDarkMode: true
    },
  
    writings: {
      name: 'Writings',
      apiEndpoint: '/api/blogs/writings',
      routePath: '/blog/writings',
      loadingText: 'Loading writings...',
      emptyStateText: 'Check back soon for new poems, stories, and creative works.',
      errorPrefix: 'writings',
      
      // Assets  
      heroImage: () => import('../../assets/writings-hero.png'),
      backgroundImage: () => import('../../assets/Wrting-background.png'),
      
      // Styling
      containerClass: 'writingsPageContainer',
      heroImageClass: 'heroImage',
      heroPositioning: {
        desktop: { x: '-45px', y: '8px' },
        mobile: { x: '8px', y: '15px' }
      },
      
      // Colors & Backgrounds
      pageBackground: '#f7eedb',
      sectionBackground: '#ffffff77',
      cardBackground: '#ffffff85',
      stripBackground: '#d1c1a0',
      mobileHeadingBackground: '#ecebeb',
      
      // Hero sizing
      heroWidth: { desktop: '180px', mobile: '160px' },
      
      supportsDarkMode: false
    },
  
    tech: {
      name: 'Tech Posts',
      apiEndpoint: '/api/blogs/tech',
      routePath: '/blog/tech',
      loadingText: 'Loading tech posts...',
      emptyStateText: 'Check back soon for new technology insights and articles.',
      errorPrefix: 'tech',
      
      // Assets
      heroImage: () => import('../../assets/techhero.png'),
      backgroundImage: () => import('../../assets/techbg.png'),
      
      // Styling
      containerClass: 'techPageContainer',
      heroImageClass: 'heroImage',
      heroPositioning: {
        desktop: { x: '0px', y: '25px' },
        mobile: { x: '8px', y: '15px' }
      },
      
      // Colors & Backgrounds
      pageBackground: '#e4e7eb',
      sectionBackground: '#ffffff6e',
      cardBackground: '#fff',
      stripBackground: '#86859a',
      mobileHeadingBackground: '#ffffffcb',
      
      // Hero sizing
      heroWidth: { desktop: '300px', mobile: '180px' },
      
      supportsDarkMode: false
    },
  
    lsconcern: {
      name: 'Legal & Social Posts',
      apiEndpoint: '/api/blogs/lsconcern',
      routePath: '/blog/lsconcern',
      loadingText: 'Loading Legal & Social posts...',
      emptyStateText: 'Check back soon for new legal insights and social commentary.',
      errorPrefix: 'Legal & Social',
      
      // Assets
      heroImage: () => import('../../assets/social-hero.png'),
      backgroundImage: () => import('../../assets/social-bg.jpg'),
      
      // Styling
      containerClass: 'lsconcernPageContainer',
      heroImageClass: 'heroImage',
      heroPositioning: {
        desktop: { x: '0px', y: '25px' },
        mobile: { x: '25px', y: '20px' }
      },
      
      // Colors & Backgrounds
      pageBackground: '#dddbd8',
      sectionBackground: '#ffffff6b',
      cardBackground: '#ffffff94',
      stripBackground: '#a19d95',
      mobileHeadingBackground: '#ecebeb',
      
      // Hero sizing
      heroWidth: { desktop: '280px', mobile: '200px' },
      
      supportsDarkMode: false
    },
  
    history: {
      name: 'History Posts',
      apiEndpoint: '/api/blogs/history',
      routePath: '/blog/history',
      loadingText: 'Loading history posts...',
      emptyStateText: 'Check back soon for new historical insights and articles.',
      errorPrefix: 'history',
      
      // Assets
      heroImage: () => import('../../assets/history-hero.png'),
      backgroundImage: () => import('../../assets/history-background.png'),
      
      // Styling
      containerClass: 'historyPageContainer',
      heroImageClass: 'heroImage',
      heroPositioning: {
        desktop: { x: '-45px', y: '8px' },
        mobile: { x: '8px', y: '15px' }
      },
      
      // Colors & Backgrounds
      pageBackground: '#E4E4E4',
      sectionBackground: '#ecebeb',
      cardBackground: '#fff',
      stripBackground: '#929292',
      mobileHeadingBackground: '#ecebeb',
      
      // Hero sizing
      heroWidth: { desktop: '160px', mobile: '120px' },
      
      supportsDarkMode: false
    }
  };
  