import { useState, useEffect, useContext } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import './assets/Home.css'
import useAuth from './customHooks/useAuth'

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleAccordion = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={`accordion-component ${isOpen ? 'open' : ''}`} onClick={toggleAccordion}>
      <h3 className={`accordion-title ${isOpen ? 'open' : ''}`}> {title} </h3>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>{children}</div>
    </div>
  )
}

const Home = () => {
  const navigate = useNavigate()
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const {
    token,
    setToken,
    usernameInSession,
    setUsernameInSession,
    userId,
    setUserId,
    roleInSession,
    setRoleInSession
  } = useAuth()

  const location = useLocation()
  const isHomePage = location.pathname === '/Home' || location.pathname === '/'

  const handleLogout = async () => {
    try {
      const invalidatedToken = await window.electronAPI.logout(token, usernameInSession)
      setToken(invalidatedToken)
      setUsernameInSession(null)
      setRoleInSession(null)
      setUserId(null)
    } catch (error) {
      // console.log("Hehe error", error);
      setIsError(true)
      setErrorMessage(error)
    }
  }

  useEffect(() => {
    if (!isHomePage) {
      localStorage.setItem('lastVisited', location.pathname + location.search)
    }
  }, [location.pathname, location.search, isHomePage])

  const lastVisited = localStorage.getItem('lastVisited')

  return (
    <div className="Home">
      <div className="navbar">
        <h2
          style={{
            cursor:
              location.pathname === '/' || location.pathname === '/Home' ? 'not-allowed' : 'pointer'
          }}
          onClick={() =>
            location.pathname !== '/' && location.pathname !== '/Home' && navigate('/Home')
          }
        >
          Hello, {usernameInSession}!
        </h2>
        <div className="accordion-main">
          {(roleInSession === 'superuser' || roleInSession === 'admin') && (
            <Accordion title="Admin">
              <button onClick={() => navigate('/Home/lease')}>Lease</button>
              <button onClick={() => navigate('/Home/tax')}>Tax Management</button>
              <button onClick={() => navigate('/Home/employee-user')}>Employee/User</button>
              <button onClick={() => navigate('/Home/backup')}>Backup</button>
            </Accordion>
          )}

          <Accordion title="Building">
            <button onClick={() => navigate('/Home/building')}>Building</button>
            <button onClick={() => navigate('/Home/floor')}>Floor</button>
            <button onClick={() => navigate('/Home/repair-maintenance')}>
              Repair and Maintenance
            </button>
          </Accordion>

          {(roleInSession === 'superuser' || roleInSession === 'employee') && (
            <Accordion title="Accounting">
              <button onClick={() => navigate('/Home/income-expenditure')}>
                Income and Expenditure
              </button>
              <button onClick={() => navigate('/Home/petty-cash-account')}>
                Petty Cash and Cash Account
              </button>
              <button onClick={() => navigate('/Home/salary-incentives')}>
                Salary and Incentives
              </button>
              <button onClick={() => navigate('/Home/advances')}>Advances</button>
              <button onClick={() => navigate('/Home/payables-receivables')}>
                Payable And Receivable
              </button>
            </Accordion>
          )}

          {/* <Accordion title="User">
            <button onClick={() => navigate('/Home/super-admin')}>Super Admin</button>
            <button onClick={() => navigate('/Home/admin-employee')}>Admin or employee</button>
            <button onClick={() => navigate('/Home/account-officials')}>Account Officials</button>
          </Accordion> */}

          <Accordion title="My Account">
            <button onClick={() => navigate('/Home/settings')}>Settings</button>
            <button onClick={() => navigate('/Home/test')}>Test</button>
          </Accordion>
        </div>
        <div className="logout">
          {isError && (
            <p style={{ color: 'red', fontSize: 'smaller', padding: '10px' }}>
              Error! Something Happened..
            </p>
          )}
          <button
            style={{
              border: '2px solid white',
              color: 'white',
              backgroundColor: 'transparent'
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="content">
        {isHomePage && (
          <div className="last-visited">
            <h1>Welcome to Mall Manager!</h1>
            <button type="button" onClick={() => navigate(lastVisited)} disabled={!lastVisited}>
              Last Visited
            </button>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  )
}

export default Home
