
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import useSession from '../stores/session'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const setSession = useSession((state) => state.setSession)

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setLoading(true)

        try {
            const response = await api.post('/users/login', {
                email,
                password
            })

            const { token, id, name } = response.data

            const user = {
                id,
                name,
                email
            }

            setSession(user, token)
            navigate('/')

        } catch (err) {
            const message = err.response?.data?.message ||
                err.response?.data ||
                'Login failed. Please try again.'

            setError(
                typeof message === 'string'
                    ? message
                    : 'Login failed. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
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

                {error && (
                    <p style={{ color: 'red' }}>{error}</p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    )
}

export default Login
