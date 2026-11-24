
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'

function Register() {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setLoading(true)

        try {
            const response = await api.post('/users/register', {
                name,
                email,
                password,
                password2
            })

            alert(response.data)
            navigate('/login')

        } catch (err) {
            const message = err.response?.data?.message ||
                err.response?.data ||
                'Registration failed. Please try again.'

            setError(
                typeof message === 'string'
                    ? message
                    : 'Registration failed. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>
                    <br />
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Email</label>
                    <br />
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Password</label>
                    <br />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <br />

                <div>
                    <label>Confirm Password</label>
                    <br />
                    <input
                        type="password"
                        placeholder="Confirm your password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        required
                    />
                </div>

                <br />

                {error && (
                    <p style={{ color: 'red' }}>{error}</p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

                       <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    )
}

export default Register
