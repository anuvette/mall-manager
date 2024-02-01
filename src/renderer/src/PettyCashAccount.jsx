import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import CustomTannyTable from './CustomTannyTable'
import { toast } from 'react-toastify'

const PettyCashAccount = () => {
  const { token, userId, usernameInSession, roleInSession } = useAuth()
  const queryClient = useQueryClient()

  const getPettyDetailsQuery = useQuery({
    queryKey: ['getPettyDetailsQuery'],
    queryFn: () => window.electronAPI.getPettyDetails(token, usernameInSession, userId),
    refetchOnWindowFocus: true
  })

  const getCashAccountDetailsQuery = useQuery({
    queryKey: ['getCashAccountDetailsQuery'],
    queryFn: () => window.electronAPI.getCashAccountDetails(token, usernameInSession, userId)
    // refetchOnWindowFocus: false,
  })

  const addPettyDetailsMutation = useMutation({
    mutationFn: (pettyData) =>
      window.electronAPI.addPettyDetails(token, usernameInSession, userId, pettyData),
    onSuccess: () => {
      toast.success('Petty Cash Records Added Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getPettyDetailsQuery'])
    }
  })

  const addCashAccountDetailsMutation = useMutation({
    mutationFn: (cashAccountData) =>
      window.electronAPI.addCashAccountDetails(token, usernameInSession, userId, cashAccountData),
    onSuccess: () => {
      toast.success('Cash Account Records Added Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getCashAccountDetailsQuery'])
    }
  })

  const updatePettyDetailsMutation = useMutation({
    mutationFn: (pettyData) =>
      window.electronAPI.updatePettyDetails(token, usernameInSession, userId, pettyData),
    onSuccess: () => {
      toast.success('Petty Cash Records Updated Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getPettyDetailsQuery'])
    }
  })

  const updateCashAccountDetailsMutation = useMutation({
    mutationFn: (cashAccountData) =>
      window.electronAPI.updateCashAccountDetails(
        token,
        usernameInSession,
        userId,
        cashAccountData
      ),
    onSuccess: () => {
      toast.success('Cash Account Records Updated Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getCashAccountDetailsQuery'])
    }
  })

  const deletePettyDetailsMutation = useMutation({
    mutationFn: (pettyIds) =>
      window.electronAPI.deletePettyDetails(token, usernameInSession, userId, pettyIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['getPettyDetailsQuery'])
      toast.success('Petty Cash Records Deleted Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
    }
  })

  const deleteCashAccountDetailsMutation = useMutation({
    mutationFn: (cashAccountIds) =>
      window.electronAPI.deleteCashAccountDetails(token, usernameInSession, userId, cashAccountIds),
    onSuccess: () => {
      toast.success('Cash Account Records Deleted Successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getCashAccountDetailsQuery'])
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
      <h1>Petty Cash and Cash Account</h1>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {getPettyDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getPettyDetailsQuery.isError ? (
          <div>Error: {getPettyDetailsQuery.error.message}</div>
        ) : (
          <CustomTannyTable
            typeId="pettyId"
            data={getPettyDetailsQuery.data}
            insertFunction={addPettyDetailsMutation}
            updateFunction={updatePettyDetailsMutation}
            deleteFunction={deletePettyDetailsMutation}
          />
        )}

        {getCashAccountDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getCashAccountDetailsQuery.isError ? (
          <div>Error: {getCashAccountDetailsQuery.error.message}</div>
        ) : (
          <CustomTannyTable
            typeId="cashAccountId"
            data={getCashAccountDetailsQuery.data}
            insertFunction={addCashAccountDetailsMutation}
            updateFunction={updateCashAccountDetailsMutation}
            deleteFunction={deleteCashAccountDetailsMutation}
          />
        )}
      </div>
    </div>
  )
}

export default PettyCashAccount
