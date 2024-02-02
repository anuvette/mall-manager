import RequireAuth from './components/RequireAuth'
import Home from './Home'
import SignIn from './SignIn'
import SignUp from './SignUp'
import Floor from './Floor'
import Lease from './Lease'
import Docs from './Docs'
import IncomeExpenditure from './IncomeExpenditure'
import Settings from './Settings'
import TaxComponent from './TaxComponent'
import Building from './Building'
import ErrorScreen from './ErrorScreen'
import ForbiddenPage from './ForbiddenPage'
import Test from './Test'
import PettyCashAccount from './PettyCashAccount'
import PayablesReceivables from './PayablesReceivables'
import Advances from './Advances'
import EmployeeCreation from './EmployeeCreation'
import SalaryIncentives from './SalaryIncentives'
import RepairMaintainance from './RepairMaintainance'
import Backup from './Backup'
import { useLocation, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

const motionProps = {
  initial: { y: '-100vh' },
  animate: { y: 0 },
  exit: { y: '100vh' },
  transition: { duration: 0.5 },
  style: { height: '100%', width: '100%' }
}

const viewTransitionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 }
}

const MyRoutes = () => {
  const location = useLocation()
  const key = location.pathname.split('/')[2] || '/'

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={key}>
          <Route path="/" element={<SignIn />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />

          <Route element={<RequireAuth allowedRole="all" />}>
            <Route path="/Home" element={<Home />}>
              <Route element={<RequireAuth allowedRole="admin" />}>
                <Route
                  path="lease"
                  element={
                    <motion.div {...motionProps}>
                      <Lease />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="admin" />}>
                <Route
                  path="docs"
                  element={
                    <motion.div {...motionProps}>
                      <Docs />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="admin" />}>
                <Route
                  path="tax"
                  element={
                    <motion.div {...motionProps}>
                      <TaxComponent />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="admin" />}>
                <Route
                  path="employee-user"
                  element={
                    <motion.div {...motionProps}>
                      <EmployeeCreation />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="admin" />}>
                <Route
                  path="backup"
                  element={
                    <motion.div {...motionProps}>
                      <Backup />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="admin" />}>
                <Route
                  path="floor"
                  element={
                    <motion.div {...motionProps}>
                      <Floor />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="employee" />}>
                <Route
                  path="income-expenditure"
                  element={
                    <motion.div {...motionProps}>
                      <IncomeExpenditure />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="employee" />}>
                <Route
                  path="petty-cash-account"
                  element={
                    <motion.div {...motionProps}>
                      <PettyCashAccount />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="admin" />}>
                <Route
                  path="salary-incentives"
                  element={
                    <motion.div {...motionProps}>
                      <SalaryIncentives />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="employee" />}>
                <Route
                  path="advances"
                  element={
                    <motion.div {...motionProps}>
                      <Advances />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="employee" />}>
                <Route
                  path="payables-receivables"
                  element={
                    <motion.div {...motionProps}>
                      <PayablesReceivables />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="admin" />}>
                <Route
                  path="building"
                  element={
                    <motion.div {...motionProps}>
                      <Building />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="all" />}>
                <Route
                  path="repair-maintenance"
                  element={
                    <motion.div {...motionProps}>
                      <RepairMaintainance />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="admin" />}>
                <Route
                  path="settings"
                  element={
                    <motion.div
                      {...motionProps}
                      style={{
                        ...motionProps.style,
                        display: 'flex'
                      }}
                    >
                      <Settings />
                    </motion.div>
                  }
                />
              </Route>
              <Route element={<RequireAuth allowedRole="all" />}>
                <Route
                  path="test"
                  element={
                    <motion.div {...motionProps}>
                      <Test />
                    </motion.div>
                  }
                />
              </Route>
              <Route path="forbidden" element={<ForbiddenPage />} />
              <Route path="*" element={<ErrorScreen />} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default MyRoutes
