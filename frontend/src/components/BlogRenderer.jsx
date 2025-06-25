// src/components/BlogRenderer.jsx
import React from 'react';

const BlogRenderer = ({ content }) => {
  if (!Array.isArray(content)) return null;

  return (
    <div className="blog-content">
      {content.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p
              key={index}
              dangerouslySetInnerHTML={{ __html: block.text }}
              style={{ marginBottom: '1.2rem', fontSize: '1.1em', lineHeight: '1.7' }}
            />
          );
        }

        if (block.type === 'image') {
          return (
            <div key={index} style={{ margin: '25px 0', textAlign: 'center' }}>
              <img
                src={block.src}
                alt={block.alt || ''}
                style={{ maxWidth: '100%', borderRadius: '12px' }}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default BlogRenderer;
