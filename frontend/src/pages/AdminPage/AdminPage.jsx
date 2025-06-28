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

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setCoverImage(file);
  };

  const handleInsertImageIntoBody = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBody((prev) => prev + `\n\n<img src="${imageUrl}" alt="Inserted" />\n\n`);
    }
  };

  const handlePublish = async () => {
    const id = uuidv4();
    const blogData = {
      id,
      title,
      subheading,
      category: category.toLowerCase(),
      content: [
        { type: 'paragraph', text: subheading },
        ...body.split('\n\n').map((block) =>
          block.includes('<img')
            ? {
                type: 'image',
                src: block.match(/src="(.*?)"/)?.[1] || '',
                alt: 'Inserted image',
              }
            : { type: 'paragraph', text: block }
        ),
      ],
      date: new Date().toISOString(),
    };

    // ✅ Debug line to confirm environment variable is loaded
    console.log('✅ Using API:', import.meta.env.VITE_API_BASE_URL);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        <label>Cover Image (above subheading)</label>
        <input type="file" accept="image/*" onChange={handleCoverImageChange} />
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
          placeholder="Write your content here. Use <a href=''> for hyperlinks or add images."
        />
        <input type="file" accept="image/*" onChange={handleInsertImageIntoBody} />
      </div>

      <div className={styles.field}>
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option value={cat} key={cat}>
              {cat}
            </option>
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
