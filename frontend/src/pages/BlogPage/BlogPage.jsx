import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BlogRenderer from '../../components/BlogRenderer.jsx';

const BlogPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    fetch(`/blogs/${id}.json`)
      .then((res) => res.json())
      .then((data) => setBlog(data));
  }, [id]);

  if (!blog) return <p>Loading...</p>;

  return <BlogRenderer blog={blog} />;
};

export default BlogPage;
