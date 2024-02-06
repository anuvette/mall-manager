import React, { useMemo, useState } from 'react'
import { useTable } from 'react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import { AnimatePresence, motion } from 'framer-motion'

const ExpenditureTable = () => {
  const { userId, usernameInSession, roleInSession, token } = useAuth() //not gonna use token or anything cuz i really dont think its important for a desktop app
  const queryClient = useQueryClient()
  const [selectedRow, setSelectedRow] = useState(null)
  const [formState, setFormState] = useState({
    expenditureId: '',
    expenditure_date: '',
    expenditure_source: '',
    expenditure_amount: ''
  })

  const getExpenditureQuery = useQuery({
    queryKey: ['expenditureQuery'],
    queryFn: () => window.electronAPI.getExpenditureTableDetails(userId)
    // refetchOnWindowFocus: false,
  })

  const addExpenditureQuery = useMutation({
    mutationFn: (expenditureData) => window.electronAPI.addExpenditureTableDetails(expenditureData),
    onSuccess: () => {
      console.log('expenditure added successfully')
      queryClient.invalidateQueries(['expenditureQuery'])
    }
  })

  const editExpenditureQuery = useMutation({
    mutationFn: (expenditureData) =>
      window.electronAPI.updateExpenditureTableDetails(expenditureData),
    onSuccess: () => {
      //console.log("Lease added successfully");
      queryClient.invalidateQueries(['expenditureQuery'])
    }
  })

  const deleteExpenditureQuery = useMutation({
    mutationFn: (expenditureData) =>
      window.electronAPI.deleteExpenditureTableDetails(expenditureData),
    onSuccess: () => {
      //console.log("Lease added successfully");
      queryClient.invalidateQueries(['expenditureQuery'])
    }
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleAddButton = (event) => {
    event.preventDefault()

    const userInput = {
      userId: userId,
      expenditure_date: formState.expenditure_date,
      expenditure_source: formState.expenditure_source,
      expenditure_amount: formState.expenditure_amount
    }

    console.log('User Input:', userInput)
    addExpenditureQuery.mutate(userInput)
    document.getElementById('expenditure-add-to-table').close()
  }

  const handleEditButton = (event) => {
    event.preventDefault()

    const userInput = {
      userId: userId,
      expenditure_date: formState.expenditure_date,
      expenditureId: formState.expenditureId,
      expenditure_source: formState.expenditure_source,
      expenditure_amount: formState.expenditure_amount
    }

    console.log('User Input for Editing:', userInput)
    editExpenditureQuery.mutate(userInput)
    setSelectedRow(null)

    document.getElementById('expenditure-edit-from-table').close()
  }

  const handleDeleteButton = () => {
    const userInput = {
      userId: userId,
      expenditureId: selectedRow.expenditureId
    }

    console.log('User Input for Deleting:', userInput)
    deleteExpenditureQuery.mutate(userInput)
    document.getElementById('expenditure-delete-from-table').close()
  }

  const COLUMNS = [
    {
      Header: 'Expenditure',
      columns: [
        {
          Header: 'SN',
          accessor: 'sn', // this accessor is just a placeholder we arent getting it from a database
          Cell: ({ row: { index } }) => index + 1
        },
        {
          Header: 'ID',
          accessor: 'expenditureId'
        },
        {
          Header: 'Date',
          accessor: 'expenditure_date'
        },
        {
          Header: 'Source',
          accessor: 'expenditure_source'
        },
        {
          Header: 'Amount',
          accessor: 'expenditure_amount'
        }
      ]
    }
  ]

  const columns = useMemo(() => COLUMNS, [])
  const memoizedExpenditureData = useMemo(
    () => getExpenditureQuery.data,
    [getExpenditureQuery.data]
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: memoizedExpenditureData || [] // use expenditureData from useQuery, if it's null or undefined, use an empty array
  })

  const total_expenditure_amount = useMemo(() => {
    return rows.reduce((sum, row) => sum + parseFloat(row.values.expenditure_amount), 0)
  }, [rows])

  if (getExpenditureQuery.isLoading) {
    return <div>Loading...</div>
  }

  if (getExpenditureQuery.isError) {
    return <div>Error: {getExpenditureQuery.error.message}</div>
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        border: '',
        minHeight: '85vh'
      }}
    >
      <div className="income-expenditure-table-button-container">
        <button
          onClick={() => {
            const dialog = document.getElementById('expenditure-add-to-table')
            if (dialog) {
              dialog.showModal()
              setFormState(null)
            }
          }}
        >
          Add
        </button>
        <dialog
          id="expenditure-add-to-table"
          className="add-to-table"
          onClick={(event) => {
            const floorModal = document.getElementById('expenditure-add-to-table')
            if (event.target === floorModal) {
              floorModal.close()
              setFormState(null)
            }
          }}
        >
          <h1>Add new Entry:</h1>
          <form onSubmit={handleAddButton}>
            <label htmlFor="add-custom-expenditure-date">Date:</label>
            <input
              id="add-custom-expenditure-date"
              name="expenditure_date"
              type="date"
              value={formState?.expenditure_date || ''}
              onChange={handleInputChange}
            />
            <label htmlFor="add-custom-expenditure-source">expenditure Source:</label>
            <input
              id="add-custom-expenditure-source"
              name="expenditure_source"
              type="text"
              value={formState?.expenditure_source || ''}
              onChange={handleInputChange}
            />
            <label htmlFor="add-custom-expenditure-amount">Amount:</label>
            <input
              id="add-custom-expenditure-amount"
              name="expenditure_amount"
              type="number"
              value={formState?.expenditure_amount || ''}
              onChange={handleInputChange}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button type="submit">Save</button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('expenditure-add-to-table').close()
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </dialog>

        <button
          onClick={() => {
            const dialog = document.getElementById('expenditure-edit-from-table')
            if (dialog) {
              dialog.showModal()
              setFormState({
                expenditure_date: selectedRow?.expenditure_date
                  ? selectedRow.expenditure_date
                  : null,
                expenditureId: selectedRow?.expenditureId ? selectedRow.expenditureId : null,
                expenditure_source: selectedRow?.expenditure_source
                  ? selectedRow.expenditure_source
                  : null,
                expenditure_amount: selectedRow?.expenditure_amount
                  ? selectedRow.expenditure_amount
                  : null
              })
            }
          }}
        >
          Edit
        </button>

        <dialog
          id="expenditure-edit-from-table"
          className="edit-table"
          onClick={(event) => {
            const floorModal = document.getElementById('expenditure-edit-from-table')
            if (event.target === floorModal) {
              floorModal.close()
            }
          }}
        >
          {selectedRow != null ? (
            <>
              <h1>Edit Entry:</h1>
              <form onSubmit={handleEditButton}>
                <label htmlFor="edit-custom-expenditure-date">Date:</label>
                <input
                  id="edit-custom-expenditure-date"
                  name="expenditure_date"
                  type="date"
                  value={formState?.expenditure_date || ''}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-custom-expenditure-source">expenditure Source:</label>
                <input
                  id="edit-custom-expenditure-source"
                  name="expenditure_source"
                  type="text"
                  value={formState?.expenditure_source || ''}
                  onChange={handleInputChange}
                />
                <label htmlFor="edit-custom-expenditure-amount">Amount:</label>
                <input
                  id="edit-custom-expenditure-amount"
                  name="expenditure_amount"
                  type="number"
                  value={formState?.expenditure_amount || ''}
                  onChange={handleInputChange}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <button type="submit">Save</button>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('expenditure-edit-from-table').close()
                      setFormState(null)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1>Edit Entry:</h1>
              <p>Nothing selected</p>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('expenditure-edit-from-table').close()
                }}
              >
                Close
              </button>
            </>
          )}
        </dialog>

        <button
          onClick={() => {
            const dialog = document.getElementById('expenditure-delete-from-table')
            if (dialog) {
              dialog.showModal()
            }
          }}
        >
          Delete
        </button>
        <dialog
          id="expenditure-delete-from-table"
          className="delete-from-table"
          onClick={(event) => {
            const floorModal = document.getElementById('expenditure-delete-from-table')
            if (event.target === floorModal) {
              floorModal.close()
            }
          }}
        >
          {selectedRow != null ? (
            <>
              <h2>Confirm Deletion:</h2>
              <p style={{ color: 'red' }}>
                Records of "{selectedRow.expenditure_source}" Id:
                {selectedRow.expenditureId}?
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <button type="button" onClick={handleDeleteButton}>
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('expenditure-delete-from-table').close()
                  }}
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              <p>Nothing is selected</p>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('expenditure-delete-from-table').close()
                }}
              >
                Close
              </button>
            </>
          )}
        </dialog>
      </div>
      <div
        style={{
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          border: '',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ minheight: '100%', overflow: 'scroll' }}>
          <table {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              <AnimatePresence>
                {rows.map((row) => {
                  prepareRow(row)
                  return (
                    <motion.tr
                      initial={{ y: -30 }}
                      animate={{
                        y: 0,
                        transition: { type: 'spring', stiffness: 200, damping: 10 }
                      }}
                      exit={{ opacity: 0, y: -30, transition: { type: 'tween', duration: 0.2 } }}
                      {...row.getRowProps()}
                      style={
                        selectedRow && selectedRow.expenditureId === row.original.expenditureId
                          ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                          : {}
                      }
                      onClick={() =>
                        setSelectedRow(
                          selectedRow && selectedRow.expenditureId === row.original.expenditureId
                            ? null
                            : row.original
                        )
                      }
                    >
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      ))}
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <p
          style={{
            position: 'sticky',
            width: '100%',
            padding: '5px',
            border: '1px solid white'
          }}
        >
          <strong>Total Expenditure:{total_expenditure_amount}</strong>
        </p>
      </div>
    </div>
  )
}

export default ExpenditureTable
