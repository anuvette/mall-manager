import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import CustomTannyTablePartTwo from './CustomTannyTablePartTwo'
import { toast } from 'react-toastify'

const PayablesReceivables = () => {
  const { token, userId, usernameInSession, roleInSession } = useAuth()
  const queryClient = useQueryClient()

  const getPayableDetailsQuery = useQuery({
    queryKey: ['getPayableDetailsQuery'],
    queryFn: () => window.electronAPI.getPayableDetails(token, usernameInSession, userId),
    refetchOnWindowFocus: true
  })

  const getReceivableDetailsQuery = useQuery({
    queryKey: ['getReceivableDetailsQuery'],
    queryFn: () => window.electronAPI.getReceivableDetails(token, usernameInSession, userId)
    // refetchOnWindowFocus: false,
  })

  const addPayableDetailsMutation = useMutation({
    mutationFn: (payableData) =>
      window.electronAPI.addPayableDetails(token, usernameInSession, userId, payableData),
    onSuccess: () => {
      toast.success('Payable details added successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getPayableDetailsQuery'])
    }
  })

  const addReceivableDetailsMutation = useMutation({
    mutationFn: (receivableData) =>
      window.electronAPI.addReceivableDetails(token, usernameInSession, userId, receivableData),
    onSuccess: () => {
      toast.success('Receivable details added successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getReceivableDetailsQuery'])
    }
  })

  const updatePayableDetailsMutation = useMutation({
    mutationFn: (payableData) =>
      window.electronAPI.updatePayableDetails(token, usernameInSession, userId, payableData),
    onSuccess: () => {
      toast.success('Payable details updated successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getPayableDetailsQuery'])
    }
  })

  const updateReceivableDetailsMutation = useMutation({
    mutationFn: (receivableData) =>
      window.electronAPI.updateReceivableDetails(token, usernameInSession, userId, receivableData),
    onSuccess: () => {
      toast.success('Receivable details updated successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getReceivableDetailsQuery'])
    }
  })

  const deletePayableDetailsMutation = useMutation({
    mutationFn: (payableIds) =>
      window.electronAPI.deletePayableDetails(token, usernameInSession, userId, payableIds),
    onSuccess: () => {
      toast.success('Payable details deleted successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getPayableDetailsQuery'])
    }
  })

  const deleteReceivableDetailsMutation = useMutation({
    mutationFn: (receivableIds) =>
      window.electronAPI.deleteReceivableDetails(token, usernameInSession, userId, receivableIds),
    onSuccess: () => {
      toast.success('Receivable details deleted successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['getReceivableDetailsQuery'])
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
      <h1>Payables and Receivables</h1>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {getPayableDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getPayableDetailsQuery.isError ? (
          <div>Error: {getPayableDetailsQuery.error.message}</div>
        ) : (
          <CustomTannyTablePartTwo
            typeId="payableId"
            data={getPayableDetailsQuery.data}
            insertFunction={addPayableDetailsMutation}
            updateFunction={updatePayableDetailsMutation}
            deleteFunction={deletePayableDetailsMutation}
          />
        )}

        {getReceivableDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getReceivableDetailsQuery.isError ? (
          <div>Error: {getReceivableDetailsQuery.error.message}</div>
        ) : (
          <CustomTannyTablePartTwo
            typeId="receivableId"
            data={getReceivableDetailsQuery.data}
            insertFunction={addReceivableDetailsMutation}
            updateFunction={updateReceivableDetailsMutation}
            deleteFunction={deleteReceivableDetailsMutation}
          />
        )}
      </div>
    </div>
  )
}

export default PayablesReceivables
