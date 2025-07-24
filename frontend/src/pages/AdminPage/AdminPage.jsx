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

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return `${import.meta.env.VITE_API_BASE_URL}${data.imageUrl}`;

    } catch (err) {
      console.error('❌ Image upload failed:', err);
      return null;
    }
  };

  const handleInsertImageIntoBody = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setBody((prev) => prev + `\n\n<img src="${imageUrl}" alt="Inserted image" class="inlineImage" />\n\n`);

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
      coverImageUrl = await uploadImage(coverImage);
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`, {
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
        <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
        {coverImage && <p>{coverImage.name}</p>}
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
          placeholder="Write your content here. Use <a href=''> for hyperlinks or insert images."
        />
        <input type="file" accept="image/*" onChange={handleInsertImageIntoBody} />
      </div>

      <div className={styles.field}>
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option value={cat} key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <button className={styles.publishButton} onClick={handlePublish}>
        Publish Blog
      </button>
    </div>
  );
};

export default AdminPage;
