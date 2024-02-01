import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import AdvancesTable from './AdvancesTable'
import { toast } from 'react-toastify'

const Advances = () => {
  const { token, userId, usernameInSession } = useAuth()
  const queryClient = useQueryClient()

  const getAdvanceDetailsQuery = useQuery({
    queryKey: ['getAdvanceDetailsQuery'],
    queryFn: () => window.electronAPI.getAdvanceDetails(token, usernameInSession, userId),
    refetchOnWindowFocus: true
  })

  const addAdvanceDetailsMutation = useMutation({
    mutationFn: (advanceData) =>
      window.electronAPI.addAdvanceDetails(token, usernameInSession, userId, advanceData),
    onSuccess: () => {
      toast.success('Records Added Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getAdvanceDetailsQuery'])
    }
  })

  const updateAdvanceDetailsMutation = useMutation({
    mutationFn: (advanceData) =>
      window.electronAPI.updateAdvanceDetails(token, usernameInSession, userId, advanceData),
    onSuccess: () => {
      toast.success('Records Updated Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getAdvanceDetailsQuery'])
    }
  })

  const deleteAdvanceDetailsMutation = useMutation({
    mutationFn: (advanceIds) =>
      window.electronAPI.deleteAdvanceDetails(token, usernameInSession, userId, advanceIds),
    onSuccess: () => {
      toast.success('Records Deleted Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getAdvanceDetailsQuery'])
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
      <h1>Advances</h1>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {getAdvanceDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getAdvanceDetailsQuery.isError ? (
          <div>Error: {getAdvanceDetailsQuery.error.message}</div>
        ) : (
          <AdvancesTable
            typeId="advanceId"
            data={getAdvanceDetailsQuery.data}
            insertFunction={addAdvanceDetailsMutation}
            updateFunction={updateAdvanceDetailsMutation}
            deleteFunction={deleteAdvanceDetailsMutation}
          />
        )}
      </div>
    </div>
  )
}

export default Advances
