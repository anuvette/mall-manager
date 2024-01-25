import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import CustomTannyTablePartTwo from './CustomTannyTablePartTwo'

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
      console.log('Payable details added successfully')
      queryClient.invalidateQueries(['getPayableDetailsQuery'])
    }
  })

  const addReceivableDetailsMutation = useMutation({
    mutationFn: (receivableData) =>
      window.electronAPI.addReceivableDetails(token, usernameInSession, userId, receivableData),
    onSuccess: () => {
      console.log('Receivables account details added successfully')
      queryClient.invalidateQueries(['getReceivableDetailsQuery'])
    }
  })

  const updatePayableDetailsMutation = useMutation({
    mutationFn: (payableData) =>
      window.electronAPI.updatePayableDetails(token, usernameInSession, userId, payableData),
    onSuccess: () => {
      console.log('Payable details updated successfully')
      queryClient.invalidateQueries(['getPayableDetailsQuery'])
    }
  })

  const updateReceivableDetailsMutation = useMutation({
    mutationFn: (receivableData) =>
      window.electronAPI.updateReceivableDetails(token, usernameInSession, userId, receivableData),
    onSuccess: () => {
      console.log('Cash account details updated successfully')
      queryClient.invalidateQueries(['getReceivableDetailsQuery'])
    }
  })

  const deletePayableDetailsMutation = useMutation({
    mutationFn: (payableIds) =>
      window.electronAPI.deletePayableDetails(token, usernameInSession, userId, payableIds),
    onSuccess: () => {
      console.log('Payable details deleted successfully')
      queryClient.invalidateQueries(['getPayableDetailsQuery'])
    }
  })

  const deleteReceivableDetailsMutation = useMutation({
    mutationFn: (receivableIds) =>
      window.electronAPI.deleteReceivableDetails(token, usernameInSession, userId, receivableIds),
    onSuccess: () => {
      console.log('Cash account details deleted successfully')
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
            columns={payableColumns}
            insertFunction={addPayableDetailsMutation.mutate}
            updateFunction={updatePayableDetailsMutation.mutate}
            deleteFunction={deletePayableDetailsMutation.mutate}
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
            columns={receivableColumns}
            insertFunction={addReceivableDetailsMutation.mutate}
            updateFunction={updateReceivableDetailsMutation.mutate}
            deleteFunction={deleteReceivableDetailsMutation.mutate}
          />
        )}
      </div>
    </div>
  )
}

// HOISTING THE COLUMNS AND DATA

const payableColumns = [
  {
    Header: 'Payables',
    columns: [
      {
        Header: 'ID',
        accessor: 'payableId'
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
                key === 'payableId' ? [key, original[key]] : [key, null]
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
                key === 'payableId' ? [key, original[key]] : [key, null]
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
        Header: (
          <div>
            Payable
            <br />
            To
          </div>
        ),
        accessor: 'payable_to',
        Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
          const inputValueRef = React.useRef(value)

          const handleInputChangeLocal = (e) => {
            const newPayableTo = e.target.value
            const nullifiedOriginal = Object.fromEntries(
              Object.keys(original).map((key) =>
                key === 'payableId' ? [key, original[key]] : [key, null]
              )
            )
            onInputChange(
              {
                ...nullifiedOriginal,
                payable_to: newPayableTo
              },
              original
            )
          }

          React.useLayoutEffect(() => {
            if (inputValueRef.current) {
              onEscapeKeyDown(inputValueRef, original.payable_to)
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
                key === 'payableId' ? [key, original[key]] : [key, null]
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

const receivableColumns = [
  {
    Header: 'Receivables',
    columns: [
      {
        Header: 'ID',
        accessor: 'receivableId'
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
                key === 'receivableId' ? [key, original[key]] : [key, null]
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
                key === 'receivableId' ? [key, original[key]] : [key, null]
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
        Header: (
          <div>
            Receivable
            <br />
            From
          </div>
        ),
        accessor: 'receivable_from',
        Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
          const inputValueRef = React.useRef(value)

          const handleInputChangeLocal = (e) => {
            const newReceivableFrom = e.target.value
            const nullifiedOriginal = Object.fromEntries(
              Object.keys(original).map((key) =>
                key === 'receivableId' ? [key, original[key]] : [key, null]
              )
            )
            onInputChange(
              {
                ...nullifiedOriginal,
                receivable_from: newReceivableFrom
              },
              original
            )
          }

          React.useLayoutEffect(() => {
            if (inputValueRef.current) {
              onEscapeKeyDown(inputValueRef, original.receivable_from)
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
                key === 'receivableId' ? [key, original[key]] : [key, null]
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

export default PayablesReceivables
