
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useSession from '../stores/session'
import './EditProfile.css'

function EditProfile() {
    const navigate = useNavigate()

    const user = useSession((state) => state.user)
    const token = useSession((state) => state.token)
    const setSession = useSession((state) => state.setSession)

    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setSuccess('')

        if (!name.trim() || !email.trim()) {
            setError('Please enter your name and email.')
            return
        }

        if (newPassword && !currentPassword) {
            setError('Enter your current password to change password.')
            return
        }

        if (newPassword && newPassword !== confirmNewPassword) {
            setError('New passwords do not match.')
            return
        }

        setLoading(true)

        try {
            const response = await api.patch('/users/edit-user', {
                name,
                email,
                currentPassword,
                newPassword,
                confirmNewPassword
            })

            const updatedUser = {
                ...user,
                id: response.data._id || user.id,
                name: response.data.name,
                email: response.data.email
            }

            setSession(updatedUser, token)

            setSuccess('Profile updated successfully!')

            setTimeout(() => {
                navigate(`/profile/${updatedUser.id}`)
            }, 1000)

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                'Failed to update profile.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="edit-profile-page">
            <div className="edit-profile-container">

                <div className="edit-profile-heading">
                    <p className="edit-profile-label">ACCOUNT SETTINGS</p>
                    <h1>Edit Your Profile</h1>
                    <p>Update your personal information and password.</p>
                </div>

                <form onSubmit={handleSubmit} className="edit-profile-form">

                    <div className="form-section">
                        <h2>Personal Information</h2>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Change Password</h2>
                        <p className="form-hint">
                            Leave these fields empty if you don't want to
                            change your password.
                        </p>

                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="edit-error">{error}</p>
                    )}

                    {success && (
                        <p className="edit-success">{success}</p>
                    )}

                    <div className="edit-profile-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-profile-btn"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default EditProfile
