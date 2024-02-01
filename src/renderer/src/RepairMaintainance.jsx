import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import RepairMaintainanceTable from './RepairMaintainanceTable'
import { toast } from 'react-toastify'

const RepairMaintainance = () => {
  const { token, usernameInSession } = useAuth()
  const queryClient = useQueryClient()

  const getAllFacilityDetailsQuery = useQuery({
    queryKey: ['getAllFacilityDetailsQuery'],
    queryFn: () => window.electronAPI.getAllFacilityDetails(token, usernameInSession),
    refetchOnWindowFocus: true
  })

  const addFacilityDetailsMutation = useMutation({
    mutationFn: (facilityData) =>
      window.electronAPI.addFacilityDetails(token, usernameInSession, facilityData),
    onSuccess: () => {
      toast.success('Records Added Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getAllFacilityDetailsQuery'])
    }
  })

  const updateFacilityDetailsMutation = useMutation({
    mutationFn: (facilityData) =>
      window.electronAPI.updateFacilityDetails(token, usernameInSession, facilityData),
    onSuccess: (something) => {
      toast.success('Records Updated Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getAllFacilityDetailsQuery'])
    }
  })

  const deleteFacilityDetailsMutation = useMutation({
    mutationFn: (facilityIds) =>
      window.electronAPI.deleteFacilityDetails(token, usernameInSession, facilityIds),
    onSuccess: () => {
      toast.success('Records Deleted Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getAllFacilityDetailsQuery'])
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
      <h1>Repair and Maintainance</h1>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {getAllFacilityDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getAllFacilityDetailsQuery.isError ? (
          <div>Error: {getAllFacilityDetailsQuery.error.message}</div>
        ) : (
          <RepairMaintainanceTable
            typeId="facilityId"
            data={getAllFacilityDetailsQuery.data}
            insertFunction={addFacilityDetailsMutation}
            updateFunction={updateFacilityDetailsMutation}
            deleteFunction={deleteFacilityDetailsMutation}
          />
        )}
      </div>
    </div>
  )
}

export default RepairMaintainance
