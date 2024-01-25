import React from 'react'
import { useNavigate } from 'react-router-dom'
import './assets/Registration.css'
import useAuth from './customHooks/useAuth'

const SignIn = () => {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isError, setIsError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const { setToken, setUsernameInSession, setRoleInSession, setUserId } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Call Electron function for login
    try {
      const token = await window.electronAPI.authenticateUser(username, password)
      console.log('here from signin.jsx line 21', token)
      if (token) {
        setUsernameInSession(token.userRecord.username)

        let role
        if (token.userRecord.isSuperUser === 1) {
          role = 'superuser'
        } else if (token.userRecord.isAdmin === 1) {
          role = 'admin'
        } else {
          role = 'employee'
        }

        setRoleInSession(role)
        setToken(token.mainToken)
        setUserId(token.userRecord.userid)
        navigate('/Home')
      } else {
        console.log(token)
        setIsError(true)
        setErrorMessage('Invalid username or password')
      }
    } catch (error) {
      console.error(error)
      setIsError(true)
      setErrorMessage('An unexpected error occurred.')
    }
  }

  const handleRegisterClick = () => {
    navigate('/SignUp')
  }

  return (
    <div className="App">
      <div className="auth-form-container">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            id="username"
            name="username"
            type="text"
            placeholder="john_doe"
            style={{
              border: '1px solid white',
              borderRadius: 0,
              color: 'white',
              backgroundColor: 'transparent'
            }}
          />

          <label htmlFor="password">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            name="password"
            type="password"
            placeholder="********"
            style={{
              border: '1px solid white',
              borderRadius: 0,
              color: 'white',
              backgroundColor: 'transparent'
            }}
          />
          <button
            style={{
              border: '2px solid white',
              color: 'white',
              backgroundColor: 'transparent'
            }}
            type="submit"
          >
            Login
          </button>
          {isError && <p style={{ color: 'red' }}>Login failed. {errorMessage}.</p>}
        </form>
        <button className="link-btn" onClick={handleRegisterClick}>
          Don't Have an Account? Register
        </button>
      </div>
    </div>
  )
}

export default SignIn
