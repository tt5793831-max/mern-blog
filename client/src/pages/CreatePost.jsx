
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

function CreatePost() {
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('Uncategorized')
    const [description, setDescription] = useState('')
    const [thumbnail, setThumbnail] = useState(null)

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!thumbnail) {
            setError('Please choose a thumbnail image.')
            return
        }

        const formData = new FormData()
        formData.append('title', title)
        formData.append('category', category)
        formData.append('description', description)
        formData.append('thumbnail', thumbnail)

        setError('')
        setLoading(true)

        try {
            await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            alert('Post created successfully!')
            navigate('/posts')

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                'Failed to create post.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>Create New Post</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title</label>
                    <br />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title"
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Category</label>
                    <br />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="Agriculture">Agriculture</option>
                        <option value="Business">Business</option>
                        <option value="Education">Education</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Art">Art</option>
                        <option value="Investment">Investment</option>
                        <option value="Uncategorized">Uncategorized</option>
                        <option value="Weather">Weather</option>
                    </select>
                </div>

                <br />

                <div>
                    <label>Description</label>
                    <br />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Write your post..."
                        rows="8"
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Thumbnail Image</label>
                    <br />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0])}
                        required
                    />
                </div>

                <br />

                {error && (
                    <p style={{ color: 'red' }}>
                        {typeof error === 'string' ? error : 'Failed to create post.'}
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    )
}

export default CreatePost
