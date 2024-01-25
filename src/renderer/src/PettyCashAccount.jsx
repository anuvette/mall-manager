import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import CustomTannyTable from './CustomTannyTable'

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
      console.log('Petty details added successfully')
      queryClient.invalidateQueries(['getPettyDetailsQuery'])
    }
  })

  const addCashAccountDetailsMutation = useMutation({
    mutationFn: (cashAccountData) =>
      window.electronAPI.addCashAccountDetails(token, usernameInSession, userId, cashAccountData),
    onSuccess: () => {
      console.log('Cash account details added successfully')
      queryClient.invalidateQueries(['getCashAccountDetailsQuery'])
    }
  })

  const updatePettyDetailsMutation = useMutation({
    mutationFn: (pettyData) =>
      window.electronAPI.updatePettyDetails(token, usernameInSession, userId, pettyData),
    onSuccess: () => {
      console.log('Petty details updated successfully')
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
      console.log('Cash account details updated successfully')
      queryClient.invalidateQueries(['getCashAccountDetailsQuery'])
    }
  })

  const deletePettyDetailsMutation = useMutation({
    mutationFn: (pettyIds) =>
      window.electronAPI.deletePettyDetails(token, usernameInSession, userId, pettyIds),
    onSuccess: () => {
      console.log('Petty details deleted successfully')
      queryClient.invalidateQueries(['getPettyDetailsQuery'])
    }
  })

  const deleteCashAccountDetailsMutation = useMutation({
    mutationFn: (cashAccountIds) =>
      window.electronAPI.deleteCashAccountDetails(token, usernameInSession, userId, cashAccountIds),
    onSuccess: () => {
      console.log('Cash account details deleted successfully')
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
            columns={pettyColumns}
            insertFunction={addPettyDetailsMutation.mutate}
            updateFunction={updatePettyDetailsMutation.mutate}
            deleteFunction={deletePettyDetailsMutation.mutate}
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
            columns={cashAccountColumns}
            insertFunction={addCashAccountDetailsMutation.mutate}
            updateFunction={updateCashAccountDetailsMutation.mutate}
            deleteFunction={deleteCashAccountDetailsMutation.mutate}
          />
        )}
      </div>
    </div>
  )
}

// HOISTING THE COLUMNS AND DATA

const pettyColumns = [
  {
    Header: 'Petty Cash',
    columns: [
      {
        Header: 'ID',
        accessor: 'pettyId'
      },
      {
        Header: 'SN',
        accessor: 'sn',
        Cell: ({ row }) => {
          return <div>{row.index + 1}</div>
        }
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
          const inputValueRef = React.useRef(value)

          const handleInputChangeLocal = (e) => {
            const newDate = e.target.value
            const nullifiedOriginal = Object.fromEntries(
              Object.keys(original).map((key) =>
                key === 'pettyId' ? [key, original[key]] : [key, null]
              )
            )
            onInputChange(
              {
                ...nullifiedOriginal,
                date: newDate
              },
              original
            )
          }

          React.useLayoutEffect(() => {
            if (inputValueRef.current) {
              onEscapeKeyDown(inputValueRef, original.date)
            }
          }, [original])

          return (
            <input
              ref={inputValueRef}
              type="date"
              defaultValue={value}
              onChange={handleInputChangeLocal}
            />
          )
        }
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
          const inputValueRef = React.useRef(value)

          const handleInputChangeLocal = (e) => {
            const newDescription = e.target.value
            const nullifiedOriginal = Object.fromEntries(
              Object.keys(original).map((key) =>
                key === 'pettyId' ? [key, original[key]] : [key, null]
              )
            )
            onInputChange(
              {
                ...nullifiedOriginal,
                description: newDescription
              },
              original
            )
          }

          React.useLayoutEffect(() => {
            if (inputValueRef.current) {
              onEscapeKeyDown(inputValueRef, original.description)
            }
          }, [original])

          return (
            <input
              ref={inputValueRef}
              type="text"
              defaultValue={value}
              onChange={handleInputChangeLocal}
            />
          )
        },
        Footer: (info) => {
          const total = React.useMemo(
            () => info.rows.reduce((sum, row) => sum + parseFloat(row.values.amount || 0), 0),
            [info.rows]
          )
          return <>Total: {total}</>
        }
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
          const inputValueRef = React.useRef(value)

          const handleInputChangeLocal = (e) => {
            const newAmount = e.target.value
            const nullifiedOriginal = Object.fromEntries(
              Object.keys(original).map((key) =>
                key === 'pettyId' ? [key, original[key]] : [key, null]
              )
            )
            onInputChange(
              {
                ...nullifiedOriginal,
                amount: newAmount
              },
              original
            )
          }

          React.useLayoutEffect(() => {
            if (inputValueRef.current) {
              onEscapeKeyDown(inputValueRef, original.amount)
            }
          }, [original])

          return (
            <input
              ref={inputValueRef}
              type="number"
              defaultValue={value}
              onChange={handleInputChangeLocal}
            />
          )
        }
      }
    ]
  }
]

const cashAccountColumns = [
  {
    Header: 'Cash Account',
    columns: [
      {
        Header: 'ID',
        accessor: 'cashAccountId'
      },
      {
        Header: 'SN',
        accessor: 'sn',
        Cell: ({ row }) => {
          return <div>{row.index + 1}</div>
        }
      },
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
          const inputValueRef = React.useRef(value)

          const handleInputChangeLocal = (e) => {
            const newDate = e.target.value
            const nullifiedOriginal = Object.fromEntries(
              Object.keys(original).map((key) =>
                key === 'cashAccountId' ? [key, original[key]] : [key, null]
              )
            )
            onInputChange(
              {
                ...nullifiedOriginal,
                date: newDate
              },
              original
            )
          }

          React.useLayoutEffect(() => {
            if (inputValueRef.current) {
              onEscapeKeyDown(inputValueRef, original.date)
            }
          }, [original])

          return (
            <input
              ref={inputValueRef}
              type="date"
              defaultValue={value}
              onChange={handleInputChangeLocal}
            />
          )
        }
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
          const inputValueRef = React.useRef(value)

          const handleInputChangeLocal = (e) => {
            const newDescription = e.target.value
            const nullifiedOriginal = Object.fromEntries(
              Object.keys(original).map((key) =>
                key === 'cashAccountId' ? [key, original[key]] : [key, null]
              )
            )
            onInputChange(
              {
                ...nullifiedOriginal,
                description: newDescription
              },
              original
            )
          }

          React.useLayoutEffect(() => {
            if (inputValueRef.current) {
              onEscapeKeyDown(inputValueRef, original.description)
            }
          }, [original])

          return (
            <input
              ref={inputValueRef}
              type="text"
              defaultValue={value}
              onChange={handleInputChangeLocal}
            />
          )
        },
        Footer: (info) => {
          const total = React.useMemo(
            () => info.rows.reduce((sum, row) => sum + parseFloat(row.values.amount || 0), 0),
            [info.rows]
          )
          return <>Total: {total}</>
        }
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
          const inputValueRef = React.useRef(value)

          const handleInputChangeLocal = (e) => {
            const newAmount = e.target.value
            const nullifiedOriginal = Object.fromEntries(
              Object.keys(original).map((key) =>
                key === 'cashAccountId' ? [key, original[key]] : [key, null]
              )
            )
            onInputChange(
              {
                ...nullifiedOriginal,
                amount: newAmount
              },
              original
            )
          }

          React.useLayoutEffect(() => {
            if (inputValueRef.current) {
              onEscapeKeyDown(inputValueRef, original.amount)
            }
          }, [original])

          return (
            <input
              ref={inputValueRef}
              type="number"
              defaultValue={value}
              onChange={handleInputChangeLocal}
            />
          )
        }
      }
    ]
  }
]

export default PettyCashAccount
