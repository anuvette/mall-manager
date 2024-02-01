import './assets/TaxComponent.css'
import CustomImageCarousel from './CustomImageCarousel'
import CustomTextCarousel from './CustomTextCarousel'
import useAuth from './customHooks/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const taxCalc = (income, expenditure) => {
  // Tax slabs for individual and married
  const slabs = {
    individual: [
      { range: 400000, rate: 0.01 },
      { range: 100000, rate: 0.1 },
      { range: 200000, rate: 0.2 },
      { range: 1300000, rate: 0.3 },
      { range: 20000000, rate: 0.36 }
    ],
    married: [
      { range: 450000, rate: 0.01 },
      { range: 100000, rate: 0.1 },
      { range: 200000, rate: 0.2 },
      { range: 1250000, rate: 0.3 },
      { range: 20000000, rate: 0.36 }
    ]
  }

  // Function to calculate tax based on given slabs
  const calculateTax = (income, slabs) => {
    let taxableIncome = Math.max(income - expenditure, 0)
    let tax = 0

    for (const slab of slabs) {
      const slabAmount = Math.min(taxableIncome, slab.range)
      tax += slabAmount * slab.rate
      taxableIncome -= slabAmount

      if (taxableIncome === 0) {
        break
      }
    }

    return tax
  }
  const individualTax = calculateTax(income, slabs.individual)
  const marriedTax = calculateTax(income, slabs.married)

  return {
    individual: `Rs. ${individualTax}`,
    married: `Rs. ${marriedTax}`
  }
}

const TaxComponent = () => {
  const { token, usernameInSession, userId } = useAuth()
  const queryClient = useQueryClient()

  const leaseQuery = useQuery({
    queryKey: ['taxLeaseData'],
    queryFn: () => window.electronAPI.getLeaseDetailsUserName(token, usernameInSession)
    // refetchOnWindowFocus: false,
  })

  const getIncomeQuery = useQuery({
    queryKey: ['incomeQuery'],
    queryFn: () => window.electronAPI.getIncomeTableDetails(userId)
    // refetchOnWindowFocus: false,
  })

  const getExpenditureQuery = useQuery({
    queryKey: ['expenditureQuery'],
    queryFn: () => window.electronAPI.getExpenditureTableDetails(userId)
    // refetchOnWindowFocus: false,
  })

  const getTaxManagerImageDetailsQuery = useQuery({
    queryKey: ['taxManagerImageData'],
    queryFn: () =>
      window.electronAPI.getTaxManagerImageDetails(
        token,
        usernameInSession,
        leaseQuery.data.details[0].leaseId
      ),
    enabled: leaseQuery.isSuccess
    // refetchOnWindowFocus: false,
  })

  const totalIncome = getIncomeQuery.data
    ? getIncomeQuery.data.reduce((sum, row) => sum + parseFloat(row.income_amount), 0)
    : 0

  const totalExpenditure = getExpenditureQuery.data
    ? getExpenditureQuery.data.reduce((sum, row) => sum + parseFloat(row.expenditure_amount), 0)
    : 0

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '10px'
        }}
      >
        <h1>Tax Overview</h1>

        <div className="tax-container">
          <div className="Property-Photo-Grid-Area-Provider">
            {leaseQuery.isSuccess && getTaxManagerImageDetailsQuery.isSuccess ? (
              <CustomImageCarousel
                queryKey={['taxManagerImageData']}
                imageDetails={getTaxManagerImageDetailsQuery.data}
              />
            ) : (
              <div style={{ border: '1px solid white', borderRadius: '10px', height: '100%' }}>
                <h2 style={{ padding: '20px' }}>An Error Occured...</h2>
              </div>
            )}
          </div>

          <div style={{ gridArea: 'Property-Details', minWidth: '100%' }}>
            {leaseQuery.isLoading && (
              <div style={{ border: '1px solid white', borderRadius: '10px', height: '100%' }}>
                <h2>Loading...</h2>
              </div>
            )}
            {leaseQuery.isError && (
              <div style={{ border: '1px solid white', borderRadius: '20px', height: '100%' }}>
                <h2 style={{ padding: '20px' }}>Ask Admin to submit your lease details!</h2>
              </div>
            )}
            {!leaseQuery.isLoading && !leaseQuery.isError && (
              <CustomTextCarousel
                header="Property Details"
                textDetails={leaseQuery.data.details || []}
                warningColor={
                  Array.isArray(leaseQuery.data.details)
                    ? leaseQuery.data.details.some(
                        (lease) =>
                          Math.floor(
                            (new Date(lease.dateOfExpiry) - new Date()) / (1000 * 60 * 60 * 24)
                          ) < 180
                      )
                      ? '#FF4081'
                      : 'white'
                    : Math.floor(
                          (new Date(leaseQuery.data.details.dateOfExpiry) - new Date()) /
                            (1000 * 60 * 60 * 24)
                        ) < 180
                      ? '#FF4081'
                      : 'white'
                }
                buttonStatus="disabled"
              />
            )}
          </div>

          <div style={{ gridArea: 'Income-Details', minWidth: '100%' }}>
            <CustomTextCarousel
              header="Income Details"
              textDetails={{
                totalIncome: `Rs. ${totalIncome}`,
                totalExpenditure: `Rs. ${totalExpenditure}`
              }}
              warningColor="white"
              buttonStatus="disabled"
            />
          </div>

          <div style={{ gridArea: 'Tax-Details', minWidth: '100%' }}>
            <CustomTextCarousel
              header="Tax Details"
              textDetails={[taxCalc(totalIncome, totalExpenditure)]}
              warningColor="white"
              buttonStatus="disabled"
            />
          </div>

          <div style={{ gridArea: 'Reports', minWidth: '100%' }}>
            <CustomTextCarousel
              header="Reports"
              textDetails={{ 'N/A': 'Feature under development. Stay tuned for updates.' }}
              warningColor="white"
              buttonStatus="disabled"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default TaxComponent
