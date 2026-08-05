import React, { useEffect, useState } from "react";
import "./ProfileDetail.css";
import { API_URL } from "../config";

const BOLLYWOOD_SONGS = [
  "Tum Hi Ho — Aashiqui 2",
  "Kesariya — Brahmastra",
  "Raabta — Agent Vinod",
  "Channa Mereya — Ae Dil Hai Mushkil",
  "Tera Ban Jaunga — Kabir Singh",
  "Ghungroo — War",
  "Ve Maahi — Kesari",
  "Shayad — Love Aaj Kal",
  "Malang — Malang",
  "Tujhe Kitna Chahne Lage — Kabir Singh",
  "Agar Tum Saath Ho — Tamasha",
  "Ilahi — Yeh Jawaani Hai Deewani",
  "Pal Pal Dil Ke Paas — Pal Pal Dil Ke Paas",
  "Bekhayali — Kabir Singh",
  "Naina — Dangal",
];

const ProfileDetail = ({
  userId,
  loggedInUser,
  friendRequests,
  onClose,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [showPostForm, setShowPostForm] = useState(false);
  const [postImage, setPostImage] = useState(null);
  const [postPreview, setPostPreview] = useState(null);
  const [postSong, setPostSong] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [posting, setPosting] = useState(false);

  const isOwnProfile = loggedInUser && loggedInUser.id === userId;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          fetch(`${API_URL}/api/users/${userId}`),
          fetch(`${API_URL}/api/posts/${userId}`),
        ]);
        const userData = await userRes.json();
        const postsData = await postsRes.json();

        setProfile(userData);
        setFullname(userData.fullname);
        setUsername(userData.username);
        setPosts(postsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [userId]);

  const followers = friendRequests.filter(
    (r) => r.status === "accepted" && r.to._id === userId
  ).length;

  const following = friendRequests.filter(
    (r) => r.status === "accepted" && r.from._id === userId
  ).length;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const data = new FormData();
      data.append("fullname", fullname);
      data.append("username", username);
      if (password.trim()) data.append("password", password);
      if (photoFile) data.append("photo", photoFile);

      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        body: data,
      });

      const updated = await res.json();

      if (!res.ok) {
        setSaveError(updated.message || "Update failed");
        return;
      }

      setProfile(updated);
      setPassword("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setSaveSuccess("Profile updated ✔");

      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err) {
      console.error(err);
      setSaveError("Server error, please try again");
    } finally {
      setSaving(false);
    }
  };

  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      setPostPreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postImage) return;
    setPosting(true);

    try {
      const data = new FormData();
      data.append("userId", userId);
      data.append("song", postSong);
      data.append("caption", postCaption);
      data.append("image", postImage);

      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        body: data,
      });

      const newPost = await res.json();

      if (res.ok) {
        setPosts((prev) => [newPost, ...prev]);
        setShowPostForm(false);
        setPostImage(null);
        setPostPreview(null);
        setPostSong("");
        setPostCaption("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="profile-detail-overlay" onClick={onClose}>
      <div className="profile-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-detail-close" onClick={onClose}>
          ×
        </button>

        {loading || !profile ? (
          <p className="profile-detail-loading">Loading profile...</p>
        ) : (
          <>
            <div className="profile-detail-header">
              <div className="profile-detail-photo-wrap">
                <img
                  src={
                    photoPreview ||
                    profile.photo ||
                    "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
                  }
                  alt={profile.fullname}
                  className="profile-detail-photo"
                />
                {isOwnProfile && (
                  <label className="profile-detail-photo-edit">
                    📷
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>

              <div className="profile-detail-stats">
                <div>
                  <strong>{posts.length}</strong>
                  <span>Posts</span>
                </div>
                <div>
                  <strong>{followers}</strong>
                  <span>Followers</span>
                </div>
                <div>
                  <strong>{following}</strong>
                  <span>Following</span>
                </div>
              </div>
            </div>

            {isOwnProfile ? (
              <form className="profile-detail-edit-form" onSubmit={handleSave}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />

                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {saveError && <p className="profile-detail-error">{saveError}</p>}
                {saveSuccess && <p className="profile-detail-success">{saveSuccess}</p>}

                <button type="submit" className="profile-detail-save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            ) : (
              <div className="profile-detail-readonly">
                <h3>{profile.fullname}</h3>
                <p className="profile-detail-username">@{profile.username}</p>
              </div>
            )}

            {isOwnProfile && (
              <button
                className="profile-detail-create-post-btn"
                onClick={() => setShowPostForm((prev) => !prev)}
              >
                ➕ Create Post
              </button>
            )}

            {showPostForm && (
              <form className="post-form" onSubmit={handleCreatePost}>
                {postPreview && (
                  <img src={postPreview} alt="Preview" className="post-form-preview" />
                )}

                <input type="file" accept="image/*" onChange={handlePostImageChange} required />

                <label>🎵 Add a Bollywood song tag</label>
                <select value={postSong} onChange={(e) => setPostSong(e.target.value)}>
                  <option value="">No song</option>
                  {BOLLYWOOD_SONGS.map((song) => (
                    <option key={song} value={song}>
                      {song}
                    </option>
                  ))}
                </select>

                <textarea
                  placeholder="Write a caption..."
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  rows={2}
                />

                <button type="submit" disabled={posting}>
                  {posting ? "Posting..." : "Share Post 💕"}
                </button>
              </form>
            )}

            <div className="profile-detail-posts-grid">
              {posts.length === 0 ? (
                <p className="profile-detail-no-posts">No posts yet</p>
              ) : (
                posts.map((post) => (
                  <div className="post-thumb" key={post._id}>
                    <img src={post.image} alt="" />
                    {post.song && <span className="post-thumb-song">🎵 {post.song}</span>}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileDetail;
