import { useState, useEffect, useRef } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import './assets/Home.css'
import useAuth from './customHooks/useAuth'
import { motion } from 'framer-motion'

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
  const createdToasts = useRef(new Set())

  const leaseQuery = useQuery({
    queryKey: ['taxLeaseData'],
    queryFn: () => window.electronAPI.getLeaseDetailsUserName(token, usernameInSession)
  })

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
      toast.dismiss()
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

  useEffect(() => {
    if (leaseQuery.isSuccess) {
      leaseQuery.data.details.forEach((lease) => {
        if (!createdToasts.current.has(lease.leaseId)) {
          const dateOfExpiry = new Date(lease.dateOfExpiry)
          const currentDate = new Date()
          const sixMonthsFromNow = new Date()
          sixMonthsFromNow.setMonth(currentDate.getMonth() + 6)
          const threeMonthsFromNow = new Date()
          threeMonthsFromNow.setMonth(currentDate.getMonth() + 3)
          const oneMonthFromNow = new Date()
          oneMonthFromNow.setMonth(currentDate.getMonth() + 1)

          const toastOptions = {
            // autoClose: 100000,
            onClick: () => {
              navigate('/Home/tax')
              toast.dismiss()
            }
          }

          if (dateOfExpiry <= currentDate) {
            toast.error(`Lease ${lease.leaseId} has expired!`, toastOptions)
          } else if (dateOfExpiry <= oneMonthFromNow) {
            toast.warn(
              `Lease ${lease.leaseId} is about to expire in less than a month!`,
              toastOptions
            )
          } else if (dateOfExpiry <= threeMonthsFromNow) {
            toast.warn(
              `Lease ${lease.leaseId} is about to expire in less than 3 months!`,
              toastOptions
            )
          } else if (dateOfExpiry <= sixMonthsFromNow) {
            toast.warn(
              `Lease ${lease.leaseId} is about to expire in less than 6 months!`,
              toastOptions
            )
          }

          createdToasts.current.add(lease.leaseId)
        }
      })
    }
  }, [leaseQuery.isSuccess])

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
              <button onClick={() => navigate('/Home/tax')}>Tax Overview</button>
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
          <motion.div
            initial={{ y: '-100vh' }}
            animate={{ y: 0 }}
            exit={{ y: '100vh' }}
            transition={{ duration: 0.5 }}
            div
            className="last-visited"
          >
            <h1>Welcome to Mall Manager!</h1>
            <button type="button" onClick={() => navigate(lastVisited)} disabled={!lastVisited}>
              Last Visited
            </button>
          </motion.div>
        )}
        <Outlet />
      </div>
    </div>
  )
}

export default Home
