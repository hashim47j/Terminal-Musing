import React, { useState } from 'react';
import styles from './AdminPage.module.css';
import { v4 as uuidv4 } from 'uuid';

const categories = [
  'Philosophy',
  'History',
  'Law',
  'Social Issues',
  'Poems',
  'Photography',
  'Short Stories',
  'Android & Linux',
];

const AdminPage = () => {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [subheading, setSubheading] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(categories[0]);
  
  // Upload progress states
  const [coverImageUploading, setCoverImageUploading] = useState(false);
  const [bodyImageUploading, setBodyImageUploading] = useState(false);

  const uploadImage = async (file, setUploading = null) => {
    if (setUploading) setUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      if (setUploading) setUploading(false);
      
      // Return the relative URL directly (no domain prefix needed)
      return data.imageUrl;  // This will be "/uploads/filename.png"

    } catch (err) {
      console.error('❌ Image upload failed:', err);
      if (setUploading) setUploading(false);
      return null;
    }
  };

  const handleInsertImageIntoBody = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadImage(file, setBodyImageUploading);
      if (imageUrl) {
        setBody((prev) => prev + `\n\n<img src="${imageUrl}" alt="Inserted image" style="max-width: 100%; height: auto;" />`);
      } else {
        alert('Image upload failed.');
      }
    }
  };

  const handlePublish = async () => {
    const now = new Date();

    const formattedDate = now
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 12); // e.g., 202507181400

    const readableTitle = title.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    const blogId = `${readableTitle}${formattedDate}`; // SuperHeroHistory202507181400

    let coverImageUrl = '';
    if (coverImage) {
      coverImageUrl = await uploadImage(coverImage, setCoverImageUploading);
      if (!coverImageUrl) {
        alert('Cover image upload failed.');
        return;
      }
    }

    const contentBlocks = body.split('\n\n').map((block) =>
      block.includes('<img')
        ? {
            type: 'image',
            src: block.match(/src="(.*?)"/)?.[1] || '',
            alt: 'Inserted image',
          }
        : { type: 'paragraph', text: block }
    );

    const blogData = {
      id: blogId,
      title,
      subheading,
      category: category.toLowerCase(),
      coverImage: coverImageUrl,
      content: [{ type: 'paragraph', text: subheading }, ...contentBlocks],
      date: now.toISOString(),
    };

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData),
      });

      if (response.ok) {
        alert('✅ Blog published successfully!');
        setTitle('');
        setCoverImage(null);
        setSubheading('');
        setBody('');
        setCategory(categories[0]);
      } else {
        const errorText = await response.text();
        console.error('❌ Server responded with:', errorText);
        alert('❌ Failed to publish blog.');
      }
    } catch (error) {
      console.error('❌ Error publishing blog:', error);
      alert('❌ An error occurred while publishing.');
    }
  };

  // Progress bar component
  const ProgressBar = ({ isUploading, text }) => {
    if (!isUploading) return null;
    
    return (
      <div style={{ 
        width: '100%', 
        backgroundColor: '#e0e0e0', 
        borderRadius: '4px', 
        marginTop: '8px',
        height: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #4CAF50, #45a049)',
          borderRadius: '4px',
          animation: 'progressAnimation 2s ease-in-out infinite',
          width: '100%'
        }} />
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {text}
        </div>
        <style>
          {`
            @keyframes progressAnimation {
              0% { opacity: 0.7; }
              50% { opacity: 1; }
              100% { opacity: 0.7; }
            }
          `}
        </style>
      </div>
    );
  };

  return (
    <div className={styles.adminPage}>
      <h1>Post a New Blog</h1>

      <div className={styles.field}>
        <label>Blog Title</label>
        <input
          type="text"
          value={title}
          placeholder="Enter title..."
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label>Cover Image</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setCoverImage(e.target.files[0])}
          disabled={coverImageUploading}
        />
        {coverImage && <p>{coverImage.name}</p>}
        <ProgressBar isUploading={coverImageUploading} text="Uploading cover image..." />
      </div>

      <div className={styles.field}>
        <label>Subheading</label>
        <input
          type="text"
          value={subheading}
          placeholder="Subheading"
          onChange={(e) => setSubheading(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label>Main Content</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your content here. Use <a href=''> for hyperlinks."
        />
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleInsertImageIntoBody}
          disabled={bodyImageUploading}
        />
        <ProgressBar isUploading={bodyImageUploading} text="Uploading image..." />
      </div>

      <div className={styles.field}>
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option value={cat} key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <button 
        className={styles.publishButton} 
        onClick={handlePublish}
        disabled={coverImageUploading || bodyImageUploading}
      >
        {(coverImageUploading || bodyImageUploading) ? 'Uploading...' : 'Publish Blog'}
      </button>
    </div>
  );
};

export default AdminPage;
