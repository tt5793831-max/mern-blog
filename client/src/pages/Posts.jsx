
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/api'

function Posts() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [search, setSearch] = useState('')
    const [searchParams, setSearchParams] = useSearchParams()

    const category = searchParams.get('category') || 'All'

    const categories = [
        'All',
        'Education',
        'Business',
        'Art',
        'Architecture'
    ]

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true)
                setError('')

                const response = await api.get('/posts')
                setPosts(response.data)
            } catch (err) {
                setError('Failed to load posts.')
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [])

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value

        if (selectedCategory === 'All') {
            setSearchParams({})
        } else {
            setSearchParams({ category: selectedCategory })
        }
    }

    const filteredPosts = posts.filter((post) => {
        const matchesSearch =
            post.title?.toLowerCase().includes(search.toLowerCase()) ||
            post.description?.toLowerCase().includes(search.toLowerCase())

        const matchesCategory =
            category === 'All' || post.category === category

        return matchesSearch && matchesCategory
    })

    if (loading) {
        return <div className="posts-message">Loading posts...</div>
    }

    if (error) {
        return <div className="posts-message">{error}</div>
    }

    return (
        <main className="posts-page">

            <section className="posts-hero">
                <span className="section-label">OUR BLOG</span>

                <h1>
                    {category === 'All'
                        ? 'Explore Our Stories'
                        : `${category} Stories`}
                </h1>

                <p>
                    {category === 'All'
                        ? 'Discover interesting stories, ideas and knowledge shared by our community.'
                        : `Explore interesting ${category.toLowerCase()} stories and ideas shared by our community.`}
                </p>
            </section>

            <section className="posts-toolbar">

                <div className="search-box">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={category}
                    onChange={handleCategoryChange}
                >
                    {categories.map((item) => (
                        <option key={item} value={item}>
                            {item === 'All' ? 'All Categories' : item}
                        </option>
                    ))}
                </select>

            </section>

            <section className="posts-grid">

                {filteredPosts.length === 0 ? (
                    <div className="empty-posts">
                        <h2>No Posts Found</h2>

                        <p>
                            {category === 'All'
                                ? 'No posts are available. Try another search.'
                                : `There are no posts in ${category} yet.`}
                        </p>

                        {category !== 'All' && (
                            <button
                                className="read-more"
                                onClick={() => setSearchParams({})}
                            >
                                View All Posts
                            </button>
                        )}
                    </div>
                ) : (

                    filteredPosts.map((post) => (

                        <article className="post-card" key={post._id}>

                            <Link to={`/posts/${post._id}`}>
                                <div className="post-image">
                                    <img
                                        src={`http://localhost:5000/uploads/${post.thumbnail}`}
                                        alt={post.title}
                                    />
                                </div>
                            </Link>

                            <div className="post-card-content">

                                <span className="post-category">
                                    {post.category}
                                </span>

                                <h2>{post.title}</h2>

                                <p>
                                    {post.description?.length > 120
                                        ? post.description.substring(0, 120) + '...'
                                        : post.description}
                                </p>

                                <Link
                                    className="read-more"
                                    to={`/posts/${post._id}`}
                                >
                                    Read More →
                                </Link>

                            </div>

                        </article>

                    ))
                )}

            </section>

        </main>
    )
}

export default Posts
