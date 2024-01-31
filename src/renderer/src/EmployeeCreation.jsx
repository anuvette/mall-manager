import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import EmployeeTable from './EmployeeTable'
import { toast } from 'react-toastify'

const EmployeeCreation = () => {
  const { token, userId, usernameInSession, roleInSession } = useAuth()
  const queryClient = useQueryClient()

  const getUserDetailsQuery = useQuery({
    queryKey: ['getUserDetailsQuery'],
    queryFn: () => window.electronAPI.getUserDetails(token, usernameInSession, userId),
    refetchOnWindowFocus: true
  })

  const addUserDetailsMutation = useMutation({
    mutationFn: (userData) =>
      window.electronAPI.addUserDetails(token, usernameInSession, userId, userData),
    onSuccess: () => {
      console.log('User details added successfully')
      toast.success('User details added successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getUserDetailsQuery'])
    }
  })

  const updateUserDetailsMutation = useMutation({
    mutationFn: (userData) =>
      window.electronAPI.updateUserDetails(token, usernameInSession, userId, userData),
    onSuccess: (something) => {
      console.log('User details updated successfully', something)
      toast.success('User details updated successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getUserDetailsQuery'])
    }
  })

  const deleteUserDetailsMutation = useMutation({
    mutationFn: (userData) =>
      window.electronAPI.deleteUserDetails(token, usernameInSession, userId, userData),
    onSuccess: () => {
      console.log('User details deleted successfully')
      toast.success('User details deleted successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getUserDetailsQuery'])
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
      <h1>Employees And Users</h1>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {getUserDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getUserDetailsQuery.isError ? (
          <div>Error: {getUserDetailsQuery.error.message}</div>
        ) : (
          <EmployeeTable
            typeId="userid"
            data={getUserDetailsQuery.data}
            insertFunction={addUserDetailsMutation}
            updateFunction={updateUserDetailsMutation}
            deleteFunction={deleteUserDetailsMutation}
          />
        )}
      </div>
    </div>
  )
}

export default EmployeeCreation
