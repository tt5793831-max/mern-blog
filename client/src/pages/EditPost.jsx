
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'

function EditPost() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('Uncategorized')
    const [description, setDescription] = useState('')
    const [thumbnail, setThumbnail] = useState(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${id}`)
                const post = response.data

                setTitle(post.title)
                setCategory(post.category)
                setDescription(post.description)
            } catch (err) {
                setError('Failed to load post.')
            } finally {
                setLoading(false)
            }
        }

        fetchPost()
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('title', title)
        formData.append('category', category)
        formData.append('description', description)

        if (thumbnail) {
            formData.append('thumbnail', thumbnail)
        }

        setError('')
        setSaving(true)

        try {
           await api.patch(`/posts/${id}`, formData)

            alert('Post updated successfully!')
            navigate(`/posts/${id}`)
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                'Failed to update post.'
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <p>Loading post...</p>
    }

    return (
        <div>
            <h1>Edit Post</h1>

            {error && (
                <p style={{ color: 'red' }}>
                    {typeof error === 'string' ? error : 'Something went wrong.'}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title</label>
                    <br />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                        rows="8"
                        required
                    />
                </div>

                <br />

                <div>
                    <label>New Thumbnail (Optional)</label>
                    <br />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0])}
                    />
                </div>

                <br />

                <button type="submit" disabled={saving}>
                    {saving ? 'Updating...' : 'Update Post'}
                </button>
            </form>
        </div>
    )
}

export default EditPost
