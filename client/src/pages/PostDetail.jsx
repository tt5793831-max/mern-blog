
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import useSession from '../stores/session'

function PostDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const user = useSession((state) => state.user)

    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${id}`)
                setPost(response.data)
            } catch (err) {
                setError('Failed to load post.')
            } finally {
                setLoading(false)
            }
        }

        fetchPost()
    }, [id])

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this post?'
        )

        if (!confirmDelete) return

        try {
            await api.delete(`/posts/${id}`)
            alert('Post deleted successfully!')
            navigate('/posts')
        } catch (err) {
            alert(
                err.response?.data?.message ||
                'Failed to delete post.'
            )
        }
    }

    if (loading) {
        return (
            <div className="article-loading">
                <p>Loading article...</p>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="article-loading">
                <h2>{error || 'Post not found.'}</h2>
                <Link to="/posts" className="back-button">
                    ← Back to Posts
                </Link>
            </div>
        )
    }

    const creatorId =
        typeof post.creator === 'object'
            ? post.creator?._id
            : post.creator

    const isOwner = user && (
        String(user.id || user._id) === String(creatorId)
    )

    return (
        <main className="article-page">

            <div className="article-top">
                <Link to="/posts" className="article-back">
                    ← Back to All Posts
                </Link>

                {isOwner && (
                    <div className="article-owner-actions">
                        <Link
                            to={`/posts/${id}/edit`}
                            className="article-edit-btn"
                        >
                            Edit Post
                        </Link>

                        <button
                            onClick={handleDelete}
                            className="article-delete-btn"
                        >
                            Delete Post
                        </button>
                    </div>
                )}
            </div>

            <article className="article-container">

                <header className="article-header">
                    <span className="article-category">
                        {post.category}
                    </span>

                    <h1>{post.title}</h1>

                    <div className="article-meta">
                        <span>By Blog Author</span>
                        <span className="meta-dot">•</span>
                        <span>
                            {post.createdAt
                                ? new Date(post.createdAt).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }
                                )
                                : 'Latest Article'}
                        </span>
                    </div>
                </header>

                <div className="article-image-wrapper">
                    <img
                        src={`http://localhost:5000/uploads/${post.thumbnail}`}
                        alt={post.title}
                        className="article-featured-image"
                    />
                </div>

                <div className="article-content">
                    <p>{post.description}</p>
                </div>

                <div className="article-bottom">
                    <span>Category: {post.category}</span>

                    <Link to="/posts" className="article-bottom-link">
                        Explore More Stories →
                    </Link>
                </div>

            </article>

        </main>
    )
}

export default PostDetail
