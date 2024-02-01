import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import SalaryIncentivesTable from './SalaryIncentivesTable'
import { toast } from 'react-toastify'

const SalaryIncentives = () => {
  const { token, userId, usernameInSession } = useAuth()
  const queryClient = useQueryClient()

  const getSalaryIncentivesDetailsQuery = useQuery({
    queryKey: ['getSalaryIncentivesDetailsQuery'],
    queryFn: () => window.electronAPI.getSalaryIncentivesDetails(token, usernameInSession, userId),
    refetchOnWindowFocus: true
  })

  const updateUserDetailsMutation = useMutation({
    mutationFn: (userData) =>
      window.electronAPI.updateSalaryIncentivesDetails(token, usernameInSession, userId, userData),
    onSuccess: (something) => {
      toast.success('Records Updated Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getSalaryIncentivesDetailsQuery'])
    }
  })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <h1>Salary and Incentives</h1>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {getSalaryIncentivesDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getSalaryIncentivesDetailsQuery.isError ? (
          <div>Error: {getSalaryIncentivesDetailsQuery.error.message}</div>
        ) : (
          <SalaryIncentivesTable
            typeId="userid"
            data={getSalaryIncentivesDetailsQuery.data}
            insertFunction={updateUserDetailsMutation}
            updateFunction={updateUserDetailsMutation}
            deleteFunction={updateUserDetailsMutation}
          />
        )}
      </div>
    </div>
  )
}

export default SalaryIncentives
