import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import AdvancesTable from './AdvancesTable'

const PayablesReceivables = () => {
  const { token, userId, usernameInSession, roleInSession } = useAuth()
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
      console.log('Advance details added successfully')
      queryClient.invalidateQueries(['getAdvanceDetailsQuery'])
    }
  })

  const updateAdvanceDetailsMutation = useMutation({
    mutationFn: (advanceData) =>
      window.electronAPI.updateAdvanceDetails(token, usernameInSession, userId, advanceData),
    onSuccess: (something) => {
      console.log('Advance details updated successfully', something)
      queryClient.invalidateQueries(['getAdvanceDetailsQuery'])
    }
  })

  const deleteAdvanceDetailsMutation = useMutation({
    mutationFn: (advanceIds) =>
      window.electronAPI.deleteAdvanceDetails(token, usernameInSession, userId, advanceIds),
    onSuccess: () => {
      console.log('Advance details deleted successfully')
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
            columns={advanceColumns}
            insertFunction={addAdvanceDetailsMutation.mutate}
            updateFunction={updateAdvanceDetailsMutation.mutate}
            deleteFunction={deleteAdvanceDetailsMutation.mutate}
          />
        )}
      </div>
    </div>
  )
}

// HOISTING THE COLUMNS AND DATA

const advanceColumns = [
  {
    Header: 'ID',
    accessor: 'advanceId'
  },
  {
    Header: 'SN',
    accessor: 'sn',
    Cell: ({ row }) => {
      return <div>{row.index + 1}</div>
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
            key === 'advanceId' ? [key, original[key]] : [key, null]
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
  },
  {
    Header: 'Recipient',
    accessor: 'recipient',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newRecipient = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'advanceId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            recipient: newRecipient
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          onEscapeKeyDown(inputValueRef, original.recipient)
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
    Header: 'Date Issued',
    accessor: 'dateIssued',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newDate = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'advanceId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            dateIssued: newDate
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          onEscapeKeyDown(inputValueRef, original.dateIssued)
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
    Header: 'Date Settled',
    accessor: 'dateSettled',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newDate = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'advanceId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            dateSettled: newDate
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          onEscapeKeyDown(inputValueRef, original.dateSettled)
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
    Header: 'Status',
    accessor: 'status',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const [isChecked, setIsChecked] = React.useState(value === 1)

      const handleCheckboxChange = () => {
        const newStatus = isChecked ? 0 : 1
        setIsChecked(!isChecked)
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'advanceId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            status: newStatus
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (isChecked !== null) {
          onEscapeKeyDown(setIsChecked, original.status)
        }
      }, [original])

      return (
        <label>
          <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
          <p
            style={{
              color: isChecked ? '#14b8a6' : 'hsl(0, 100%, 50%)'
            }}
          >
            {isChecked ? 'Settled' : 'Unsettled'}
          </p>
        </label>
      )
    }
  }
]

export default PayablesReceivables
