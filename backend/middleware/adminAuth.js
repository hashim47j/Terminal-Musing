import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to check if admin is authenticated
export const requireAdminAuth = (req, res, next) => {
  const isAuthenticated = req.session?.adminAuthenticated || false;
  
  console.log('🛡️ Admin auth check:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('❌ Unauthorized admin access attempt');
    
    // If it's an API request, return JSON
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login first.' 
      });
    }
    
    // For web requests, redirect to login
    return res.redirect('/admin/login');
  }
  
  console.log('✅ Admin authenticated, allowing access');
  next();
};
