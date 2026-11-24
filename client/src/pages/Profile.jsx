
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import './Profile.css'

function Profile() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [userResponse, postsResponse] = await Promise.all([
                    api.get(`/users/${id}`),
                    api.get(`/posts/users/${id}`)
                ])

                setUser(userResponse.data)
                setPosts(postsResponse.data)
            } catch (err) {
                setError('Failed to load user profile.')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [id])

    if (loading) {
        return <div className="profile-loading">Loading profile...</div>
    }

    if (error) {
        return <div className="profile-error">{error}</div>
    }

    if (!user) {
        return <div className="profile-error">User not found.</div>
    }

    return (
        <div className="profile-page">
            <div className="profile-container">

                <section className="profile-header">
                    <div className="profile-avatar">
                        {user.avatar ? (
                            <img
                                src={`http://localhost:5000/uploads/${user.avatar}`}
                                alt={user.name}
                            />
                        ) : (
                            <span>
                                {user.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="profile-info">
                        <p className="profile-label">AUTHOR PROFILE</p>
                        <h1>{user.name}</h1>
                        <p className="profile-email">{user.email}</p>

                        <p className="profile-bio">
                            Sharing ideas, stories and perspectives.
                        </p>

                        <button
                            className="edit-profile-btn"
                            onClick={() => navigate('/edit-profile')}
                        >
                            Edit Profile
                        </button>
                    </div>
                </section>

                <section className="profile-stats">
                    <div className="stat-item">
                        <h2>{posts.length}</h2>
                        <p>Posts</p>
                    </div>

                    <div className="stat-item">
                        <h2>0</h2>
                        <p>Followers</p>
                    </div>

                    <div className="stat-item">
                        <h2>0</h2>
                        <p>Following</p>
                    </div>
                </section>

                <section className="profile-stories">
                    <div className="stories-heading">
                        <div>
                            <p className="profile-label">YOUR CONTENT</p>
                            <h2>Published Stories</h2>
                        </div>
                    </div>

                    {posts.length > 0 ? (
                        <div className="profile-posts-grid">
                            {posts.map((post) => (
                                <article
                                    className="profile-post-card"
                                    key={post._id}
                                    onClick={() => navigate(`/posts/${post._id}`)}
                                >
                                    <img
                                        src={`http://localhost:5000/uploads/${post.thumbnail}`}
                                        alt={post.title}
                                    />

                                    <div className="profile-post-content">
                                        <p className="profile-post-category">
                                            {post.category}
                                        </p>

                                        <h3>{post.title}</h3>

                                        <span>Read Story →</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-stories">
                            <h3>No stories published yet</h3>
                            <p>
                                Your published articles will appear here.
                                Start writing your first story.
                            </p>
                        </div>
                    )}
                </section>

            </div>
        </div>
    )
}

export default Profile
