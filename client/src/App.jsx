
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Posts from './pages/Posts'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'

import useSession from './stores/session'

function Home() {
    const user = useSession((state) => state.user)
    const clearSession = useSession((state) => state.clearSession)

    return (
        <main className="home-page">

            <section className="home-hero">

                <div className="hero-content">
                    <span className="section-label">
                        WELCOME TO OUR BLOG
                    </span>

                    <h1>
                        Stories That
                        <br />
                        Inspire Your
                        <span> World.</span>
                    </h1>

                    <p>
                        Discover new ideas, share your knowledge
                        and explore interesting stories from our community.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/posts" className="hero-primary-btn">
                            Explore Articles →
                        </Link>

                        <Link to="/create-post" className="hero-secondary-btn">
                            Write a Story
                        </Link>
                    </div>

                    <p className="welcome-user">
                        Welcome back, {user?.name || 'User'}!
                    </p>
                </div>

                <div className="hero-image">
                    <img
                        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000"
                        alt="Beautiful workspace with notebook and laptop"
                    />
                </div>

            </section>

            <section className="home-categories">

                <div className="home-section-heading">
                    <span className="section-label">DISCOVER</span>
                    <h2>Explore Our Categories</h2>
                    <p>Find stories that match your interests.</p>
                </div>

                <div className="category-grid">

                    <Link
                        to="/posts?category=Education"
                        className="category-card"
                    >
                        <span>📚</span>
                        <h3>Education</h3>
                        <p>Learn something new</p>
                    </Link>

                    <Link
                        to="/posts?category=Business"
                        className="category-card"
                    >
                        <span>💼</span>
                        <h3>Business</h3>
                        <p>Ideas and opportunities</p>
                    </Link>

                    <Link
                        to="/posts?category=Art"
                        className="category-card"
                    >
                        <span>🎨</span>
                        <h3>Art</h3>
                        <p>Creativity and inspiration</p>
                    </Link>

                    <Link
                        to="/posts?category=Architecture"
                        className="category-card"
                    >
                        <span>🏛️</span>
                        <h3>Architecture</h3>
                        <p>Design and buildings</p>
                    </Link>

                </div>

            </section>

            <section className="home-cta">
                <h2>Have a Story to Share?</h2>

                <p>
                    Your ideas matter. Create a post and share your
                    knowledge with our community.
                </p>

                <Link to="/create-post">
                    Start Writing →
                </Link>
            </section>

            <footer className="home-footer">
                <p>© 2026 MERN Blog. Share ideas. Inspire people.</p>

                <button onClick={clearSession}>
                    Logout
                </button>
            </footer>

        </main>
    )
}

function App() {
    const token = useSession((state) => state.token)
    const user = useSession((state) => state.user)

    return (
        <BrowserRouter>
            <nav className="main-nav">

                <Link to="/" className="nav-logo">
                    <span>✦</span> MERN Blog
                </Link>

                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/posts">All Posts</Link>

                    {token && (
                        <>
                            <Link to="/create-post">Create Post</Link>

                            <Link to={`/profile/${user?.id || user?._id}`}>
                                Profile
                            </Link>
                        </>
                    )}

                    {!token && (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>

            </nav>

            <Routes>
                <Route
                    path="/"
                    element={token ? <Home /> : <Navigate to="/login" />}
                />

                <Route
                    path="/login"
                    element={token ? <Navigate to="/" /> : <Login />}
                />

                <Route
                    path="/register"
                    element={token ? <Navigate to="/" /> : <Register />}
                />

                <Route
                    path="/posts"
                    element={<Posts />}
                />

                <Route
                    path="/posts/:id"
                    element={<PostDetail />}
                />

                <Route
                    path="/create-post"
                    element={token ? <CreatePost /> : <Navigate to="/login" />}
                />

                <Route
                    path="/posts/:id/edit"
                    element={token ? <EditPost /> : <Navigate to="/login" />}
                />

                <Route
                    path="/profile/:id"
                    element={token ? <Profile /> : <Navigate to="/login" />}
                />

                <Route
                    path="/edit-profile"
                    element={token ? <EditProfile /> : <Navigate to="/login" />}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App
