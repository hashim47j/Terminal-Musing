import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./AdminPage.module.css";
import { v4 as uuidv4 } from "uuid";

const categoryOptions = [
  { display: "Philosophy", backend: "philosophy" },
  { display: "History", backend: "history" },
  { display: "Technology", backend: "tech" },
  { display: "Legal & Social Issues", backend: "lsconcern" },
  { display: "Writings", backend: "writings" },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [subheading, setSubheading] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(categoryOptions[0].backend);
  const [author, setAuthor] = useState("");

  const [coverImageUploading, setCoverImageUploading] = useState(false);
  const [bodyImageUploading, setBodyImageUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // ✅ Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const uploadImage = async (file, setUploading = null) => {
    if (setUploading) setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // ✅ Ensure session is sent
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (setUploading) setUploading(false);
      return data.imageUrl;
    } catch (err) {
      console.error("❌ Image upload failed:", err);
      if (setUploading) setUploading(false);
      alert("❌ Image upload failed. Please try again.");
      return null;
    }
  };

  const handleInsertImageIntoBody = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("❌ Image too large. Maximum size is 10MB.");
        return;
      }

      const imageUrl = await uploadImage(file, setBodyImageUploading);
      if (imageUrl) {
        setBody(
          (prev) =>
            prev +
            `\n\n<img src="${imageUrl}" alt="Inserted image" style="max-width: 100%; height: auto;" />`
        );
        alert("✅ Image inserted successfully!");
      }
    }
    e.target.value = "";
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert("❌ Please enter a blog title.");
      return;
    }

    if (!body.trim()) {
      alert("❌ Please enter blog content.");
      return;
    }

    setPublishing(true);

    try {
      const now = new Date();
      const formattedDate = now
        .toISOString()
        .replace(/[-:T]/g, "")
        .slice(0, 12);

      const readableTitle = title
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");
      const blogId = `${readableTitle}${formattedDate}`;

      let coverImageUrl = "";
      if (coverImage) {
        coverImageUrl = await uploadImage(coverImage, setCoverImageUploading);
        if (!coverImageUrl) {
          setPublishing(false);
          return;
        }
      }

      const contentBlocks = body
        .split("\n\n")
        .map((block) => {
          if (block.includes("<img")) {
            return {
              type: "image",
              src: block.match(/src="(.*?)"/)?.[1] || "",
              alt: "Inserted image",
            };
          } else if (block.trim()) {
            return { type: "paragraph", text: block.trim() };
          }
          return null;
        })
        .filter(Boolean);

      const blogData = {
        id: blogId,
        title: title.trim(),
        subheading: subheading.trim(),
        category: category,
        coverImage: coverImageUrl,
        content: contentBlocks,
        date: now.toISOString(),
        author: author.trim() || "Terminal Musing",
      };

      console.log("📤 Publishing blog:", blogData);

      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Protect API call
        body: JSON.stringify(blogData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Blog published:", result);
        alert("✅ Blog published successfully!");

        setTitle("");
        setCoverImage(null);
        setSubheading("");
        setBody("");
        setAuthor("");
        setCategory(categoryOptions[0].backend);

        document
          .querySelectorAll('input[type="file"]')
          .forEach((input) => (input.value = ""));
      } else {
        const errorData = await response.json();
        console.error("❌ Server error:", errorData);
        alert(`❌ Failed to publish blog: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Error publishing blog:", error);
      alert(
        "❌ An error occurred while publishing. Please check your connection and try again."
      );
    } finally {
      setPublishing(false);
    }
  };

  const ProgressBar = ({ isUploading, text }) => {
    if (!isUploading) return null;
    return (
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
          <div className={styles.progressText}>{text}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div className={styles.loading}>Redirecting to login...</div>;
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <h1>📝 Create New Blog Post</h1>
        <p className={styles.subtitle}>Publish content to Terminal Musing</p>
      </div>

      <form className={styles.blogForm} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formGrid}>
          {/* Title */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <span className={styles.labelText}>Blog Title *</span>
              <span className={styles.fieldDescription}>
                Enter a compelling title for your blog post
              </span>
            </label>
            <input
              type="text"
              className={styles.titleInput}
              value={title}
              placeholder="Enter your blog title here..."
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <div className={styles.charCount}>{title.length}/200</div>
          </div>

          {/* Category */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <span className={styles.labelText}>Category *</span>
              <span className={styles.fieldDescription}>
                Select the appropriate category for your post
              </span>
            </label>
            <select
              className={styles.categorySelect}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categoryOptions.map((cat) => (
                <option value={cat.backend} key={cat.backend}>
                  {cat.display}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Author */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <span className={styles.labelText}>Author Name</span>
            <span className={styles.fieldDescription}>
              Enter the author's name (optional - defaults to "Terminal Musing")
            </span>
          </label>
          <input
            type="text"
            className={styles.authorInput}
            value={author}
            placeholder="Enter author name..."
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={100}
          />
          <div className={styles.charCount}>{author.length}/100</div>
        </div>

        {/* Cover Image */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <span className={styles.labelText}>Cover Image</span>
            <span className={styles.fieldDescription}>
              Upload a high-quality cover image (max 10MB)
            </span>
          </label>
          <div className={styles.fileUploadContainer}>
            <input
              type="file"
              id="coverImage"
              className={styles.fileInput}
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0])}
              disabled={coverImageUploading || publishing}
            />
            <label htmlFor="coverImage" className={styles.fileInputLabel}>
              {coverImage ? `📁 ${coverImage.name}` : "📁 Choose Cover Image"}
            </label>
          </div>
          <ProgressBar
            isUploading={coverImageUploading}
            text="Uploading cover image..."
          />
        </div>

        {/* Subheading */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <span className={styles.labelText}>Subheading</span>
            <span className={styles.fieldDescription}>
              Brief description or subtitle (optional)
            </span>
          </label>
          <input
            type="text"
            className={styles.subheadingInput}
            value={subheading}
            placeholder="Enter a descriptive subheading..."
            onChange={(e) => setSubheading(e.target.value)}
            maxLength={300}
          />
          <div className={styles.charCount}>{subheading.length}/300</div>
        </div>

        {/* Content */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <span className={styles.labelText}>Content *</span>
            <span className={styles.fieldDescription}>
              Write your blog content. Use HTML tags for formatting.
            </span>
          </label>
          <textarea
            className={styles.contentTextarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your blog content here..."
          />
          <div className={styles.charCount}>{body.length} characters</div>

          <div className={styles.imageInsertContainer}>
            <input
              type="file"
              id="bodyImage"
              className={styles.fileInput}
              accept="image/*"
              onChange={handleInsertImageIntoBody}
              disabled={bodyImageUploading || publishing}
            />
            <label htmlFor="bodyImage" className={styles.imageInsertButton}>
              🖼️ Insert Image into Content
            </label>
            <ProgressBar
              isUploading={bodyImageUploading}
              text="Uploading image..."
            />
          </div>
        </div>

        {/* Publish Button */}
        <div className={styles.publishSection}>
          <button
            className={`${styles.publishButton} ${
              coverImageUploading || bodyImageUploading || publishing
                ? styles.publishing
                : ""
            }`}
            onClick={handlePublish}
            disabled={coverImageUploading || bodyImageUploading || publishing}
          >
            {publishing ? (
              <>
                <span className={styles.spinner}></span>
                Publishing...
              </>
            ) : (
              "🚀 Publish Blog Post"
            )}
          </button>

          <div className={styles.publishNote}>
            <small>
              Once published, your blog will be available at:{" "}
              <code>/blog/{category.toLowerCase()}/[generated-id]</code>
            </small>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminPage;
