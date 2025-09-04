// frontend/src/context/BlogContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const BlogContext = createContext();

const initialState = {
  posts: {
    writings: { data: [], loading: false, error: '', loaded: false },
    tech: { data: [], loading: false, error: '', loaded: false },
    lsconcern: { data: [], loading: false, error: '', loaded: false },
    history: { data: [], loading: false, error: '', loaded: false },
    philosophy: { data: [], loading: false, error: '', loaded: false }
  },
  currentAuthor: 'Terminal Musing',
  imageCache: new Map(),
  backgroundCache: new Map(),
  heroImageCache: new Map(),
  backgroundImageCache: new Map()
};

function blogReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.category]: {
            ...state.posts[action.category],
            loading: true,
            error: ''
          }
        }
      };

    case 'SET_POSTS':
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.category]: {
            data: action.posts,
            loading: false,
            error: '',
            loaded: true
          }
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.category]: {
            ...state.posts[action.category],
            loading: false,
            error: action.error
          }
        }
      };

    case 'SET_AUTHOR':
      return {
        ...state,
        currentAuthor: action.author
      };

    case 'CACHE_IMAGE':
      const newImageCache = new Map(state.imageCache);
      newImageCache.set(action.url, true);
      return {
        ...state,
        imageCache: newImageCache
      };

    case 'CACHE_BACKGROUND':
      const newBgCache = new Map(state.backgroundCache);
      newBgCache.set(action.url, action.shadowColor);
      return {
        ...state,
        backgroundCache: newBgCache
      };

    case 'CACHE_HERO_IMAGE':
      const newHeroCache = new Map(state.heroImageCache);
      newHeroCache.set(action.url, true);
      return {
        ...state,
        heroImageCache: newHeroCache
      };

    case 'CACHE_BACKGROUND_IMAGE':
      const newBgImageCache = new Map(state.backgroundImageCache);
      newBgImageCache.set(action.url, true);
      return {
        ...state,
        backgroundImageCache: newBgImageCache
      };

    default:
      return state;
  }
}

export function BlogProvider({ children }) {
  const [state, dispatch] = useReducer(blogReducer, initialState);

  // Fetch author once globally
  useEffect(() => {
    const fetchCurrentAuthor = async () => {
      try {
        const endpoints = [
          '/api/user/me',
          '/api/admin/profile', 
          '/api/auth/user',
          '/api/current-user'
        ];
        
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint);
            if (res.ok) {
              const userData = await res.json();
              const authorName = userData.name || 
                               userData.username || 
                               userData.displayName || 
                               userData.fullName ||
                               'Terminal Musing';
              dispatch({ type: 'SET_AUTHOR', author: authorName });
              return;
            }
          } catch (err) {
            continue;
          }
        }
        
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          dispatch({ 
            type: 'SET_AUTHOR', 
            author: user.name || user.username || 'Terminal Musing' 
          });
        }
      } catch (err) {
        dispatch({ type: 'SET_AUTHOR', author: 'Terminal Musing' });
      }
    };

    fetchCurrentAuthor();
  }, []);

  const fetchPosts = async (category, apiEndpoint) => {
    const categoryState = state.posts[category];
    
    if (categoryState.loaded || categoryState.loading) {
      return;
    }

    dispatch({ type: 'SET_LOADING', category });

    try {
      const res = await fetch(apiEndpoint);
      if (!res.ok) throw new Error(`Failed to fetch blogs (status: ${res.status})`);
      
      const data = await res.json();
      
      let postsArray = [];
      if (Array.isArray(data)) {
        postsArray = data;
      } else if (data && Array.isArray(data.blogs)) {
        postsArray = data.blogs;
      } else {
        postsArray = [];
      }

      const sorted = postsArray
        .filter(post => post && post.id && post.title)
        .sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return dateB - dateA;
        });
        
      dispatch({ type: 'SET_POSTS', category, posts: sorted });
    } catch (err) {
      dispatch({ 
        type: 'SET_ERROR', 
        category, 
        error: `Failed to load ${category} posts: ${err.message}` 
      });
    }
  };

  const value = {
    state,
    dispatch,
    fetchPosts,
    isImageCached: (url) => state.imageCache.has(url),
    getBackgroundCache: (url) => state.backgroundCache.get(url),
    cacheImage: (url) => dispatch({ type: 'CACHE_IMAGE', url }),
    cacheBackground: (url, shadowColor) => dispatch({ type: 'CACHE_BACKGROUND', url, shadowColor }),
    isHeroImageCached: (url) => state.heroImageCache.has(url),
    isBackgroundImageCached: (url) => state.backgroundImageCache.has(url),
    cacheHeroImage: (url) => dispatch({ type: 'CACHE_HERO_IMAGE', url }),
    cacheBackgroundImage: (url) => dispatch({ type: 'CACHE_BACKGROUND_IMAGE', url })
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
}

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within BlogProvider');
  }
  return context;
};
