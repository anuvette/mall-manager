import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './assets/Registration.css'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(name)
    console.log(email)
    console.log(password)
  }

  const handleSignInClick = () => {
    navigate('/SignIn')
  }

  return (
    <div className="App">
      <div className="auth-form-container">
        <h2>Register</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="name"
            name="name"
            placeholder="John Doe"
            style={{
              border: '1px solid white',
              borderRadius: 0,
              color: 'white',
              backgroundColor: 'transparent',
              cursor: 'not-allowed'
            }}
            disabled
          />

          <label htmlFor="email">Contact</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            name="email"
            type="email"
            placeholder="9812312345"
            style={{
              border: '1px solid white',
              borderRadius: 0,
              color: 'white',
              backgroundColor: 'transparent',
              cursor: 'not-allowed'
            }}
            disabled
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
              backgroundColor: 'transparent',
              cursor: 'not-allowed'
            }}
            disabled
          />
          <button
            style={{
              border: '2px solid white',
              color: 'white',
              backgroundColor: 'transparent',
              cursor: 'not-allowed'
            }}
            type="submit"
            disabled
          >
            Sign Up
          </button>
        </form>
        <button className="link-btn" onClick={handleSignInClick}>
          Already Have an Account? Sign In!
        </button>
        <h6 style={{ color: 'red' }}>Signup currently disabled.</h6>
        <h6 style={{ color: 'red' }}>Ask your Employer for your account Information</h6>
      </div>
    </div>
  )
}

export default SignIn
