import React from 'react'
import { createRoot } from 'react-dom/client'
import { Routes, Route, HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './assets/ToastOverride.css'
import { AuthContextProvider } from './components/AuthContext'
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

const root = document.getElementById('root')
const queryClient = new QueryClient()

createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <HashRouter>
          <ToastContainer hideProgressBar={true} />
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/SignIn" element={<SignIn />} />
            <Route path="/SignUp" element={<SignUp />} />

            <Route element={<RequireAuth allowedRole="all" />}>
              <Route path="/Home" element={<Home />}>
                <Route element={<RequireAuth allowedRole="admin" />}>
                  <Route path="lease" element={<Lease />} />
                </Route>
                <Route element={<RequireAuth allowedRole="admin" />}>
                  <Route path="docs" element={<Docs />} />
                </Route>
                <Route element={<RequireAuth allowedRole="admin" />}>
                  <Route path="tax" element={<TaxComponent />} />
                </Route>
                <Route element={<RequireAuth allowedRole="admin" />}>
                  <Route path="employee-user" element={<EmployeeCreation />} />
                </Route>
                <Route element={<RequireAuth allowedRole="all" />}>
                  <Route path="backup" element={<Backup />} />
                </Route>
                <Route element={<RequireAuth allowedRole="admin" />}>
                  <Route path="floor" element={<Floor />} />
                </Route>
                <Route element={<RequireAuth allowedRole="employee" />}>
                  <Route path="income-expenditure" element={<IncomeExpenditure />} />
                </Route>
                <Route element={<RequireAuth allowedRole="employee" />}>
                  <Route path="petty-cash-account" element={<PettyCashAccount />} />
                </Route>
                <Route element={<RequireAuth allowedRole="admin" />}>
                  <Route path="salary-incentives" element={<SalaryIncentives />} />
                </Route>
                <Route element={<RequireAuth allowedRole="employee" />}>
                  <Route path="advances" element={<Advances />} />
                </Route>
                <Route element={<RequireAuth allowedRole="employee" />}>
                  <Route path="payables-receivables" element={<PayablesReceivables />} />
                </Route>
                <Route element={<RequireAuth allowedRole="admin" />}>
                  <Route path="building" element={<Building />} />
                </Route>
                <Route element={<RequireAuth allowedRole="all" />}>
                  <Route path="repair-maintenance" element={<RepairMaintainance />} />
                </Route>
                <Route element={<RequireAuth allowedRole="admin" />}>
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route element={<RequireAuth allowedRole="all" />}>
                  <Route path="test" element={<Test />} />
                </Route>
                <Route path="forbidden" element={<ForbiddenPage />} />
                <Route path="*" element={<ErrorScreen />} />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </AuthContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
