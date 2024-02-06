import React, { useMemo, useState } from 'react'
import { useTable, useSortBy } from 'react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import { AnimatePresence, motion } from 'framer-motion'

const IncomeTable = () => {
  const { userId, usernameInSession, roleInSession, token } = useAuth() //not gonna use token or anything cuz i really dont think its important for a desktop app
  const queryClient = useQueryClient()
  const [selectedRow, setSelectedRow] = useState(null)
  const [formState, setFormState] = useState({
    incomeId: '',
    income_date: '',
    income_source: '',
    income_amount: ''
  })

  const getIncomeQuery = useQuery({
    queryKey: ['incomeQuery'],
    queryFn: () => window.electronAPI.getIncomeTableDetails(userId)
    // refetchOnWindowFocus: false,
  })

  const addIncomeQuery = useMutation({
    mutationFn: (incomeData) => window.electronAPI.addIncomeTableDetails(incomeData),
    onSuccess: () => {
      console.log('income added successfully')
      queryClient.invalidateQueries(['incomeQuery'])
    }
  })

  const editIncomeQuery = useMutation({
    mutationFn: (incomeData) => window.electronAPI.updateIncomeTableDetails(incomeData),
    onSuccess: () => {
      //console.log("Lease added successfully");
      queryClient.invalidateQueries(['incomeQuery'])
    }
  })

  const deleteIncomeQuery = useMutation({
    mutationFn: (incomeData) => window.electronAPI.deleteIncomeTableDetails(incomeData),
    onSuccess: () => {
      //console.log("Lease added successfully");
      queryClient.invalidateQueries(['incomeQuery'])
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
      income_date: formState.income_date,
      income_source: formState.income_source,
      income_amount: formState.income_amount
    }

    console.log('User Input:', userInput)
    addIncomeQuery.mutate(userInput)
    document.getElementById('income-add-to-table').close()
  }

  const handleEditButton = (event) => {
    event.preventDefault()

    const userInput = {
      userId: userId,
      incomeId: formState.incomeId,
      income_date: formState.income_date,
      income_source: formState.income_source,
      income_amount: formState.income_amount
    }

    console.log('User Input for Editing:', userInput)
    editIncomeQuery.mutate(userInput)
    setSelectedRow(null)

    document.getElementById('income-edit-from-table').close()
  }

  const handleDeleteButton = () => {
    const userInput = {
      userId: userId,
      incomeId: selectedRow.incomeId
    }

    console.log('User Input for Deleting:', userInput)
    deleteIncomeQuery.mutate(userInput)
    document.getElementById('income-delete-from-table').close()
  }

  const columns = useMemo(
    () => [
      {
        Header: 'Income',
        columns: [
          {
            Header: 'SN',
            accessor: 'sn', // this accessor is just a placeholder we aren't getting it from a database
            Cell: ({ row: { index } }) => index + 1
          },
          {
            Header: 'ID',
            accessor: 'incomeId'
          },
          {
            Header: 'Date',
            accessor: 'income_date'
          },
          {
            Header: 'Source',
            accessor: 'income_source'
          },
          {
            Header: 'Amount',
            accessor: 'income_amount'
          }
        ]
      }
    ],
    []
  )

  const memoizedIncomeData = useMemo(() => getIncomeQuery.data, [getIncomeQuery.data])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: memoizedIncomeData || [], // use incomeData from useQuery, if it's null or undefined, use an empty array
      autoResetSortBy: false,
      autoResetPage: false
    },
    useSortBy
  )

  const total_income_amount =
    rows.length > 0 ? rows.reduce((sum, row) => sum + parseFloat(row.values.income_amount), 0) : 0

  // useEffect(() => {
  //     console.log("Selected Row:", selectedRow);
  // }, [selectedRow]);

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
            const dialog = document.getElementById('income-add-to-table')
            if (dialog) {
              dialog.showModal()
              setFormState(null)
            }
          }}
        >
          Add
        </button>
        <dialog
          id="income-add-to-table"
          className="add-to-table"
          onClick={(event) => {
            const floorModal = document.getElementById('income-add-to-table')
            if (event.target === floorModal) {
              floorModal.close()
              setFormState(null)
            }
          }}
        >
          <h1>Add new Entry:</h1>
          <form onSubmit={handleAddButton}>
            <label htmlFor="add-custom-income-date">Date:</label>
            <input
              id="add-custom-income-date"
              name="income_date"
              type="date"
              value={formState?.income_date || ''}
              onChange={handleInputChange}
            />

            <label htmlFor="add-custom-income-source">Income Source:</label>
            <input
              id="add-custom-income-source"
              name="income_source"
              type="text"
              value={formState?.income_source || ''}
              onChange={handleInputChange}
            />
            <label htmlFor="add-custom-income-amount">Amount:</label>
            <input
              id="add-custom-income-amount"
              name="income_amount"
              type="number"
              value={formState?.income_amount || ''}
              onChange={handleInputChange}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button type="submit">Save</button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('income-add-to-table').close()
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </dialog>

        <button
          onClick={() => {
            const dialog = document.getElementById('income-edit-from-table')
            if (dialog) {
              dialog.showModal()
              setFormState({
                incomeId: selectedRow?.incomeId ? selectedRow.incomeId : null,
                income_date: selectedRow?.income_date ? selectedRow.income_date : null,
                income_source: selectedRow?.income_source ? selectedRow.income_source : null,
                income_amount: selectedRow?.income_amount ? selectedRow.income_amount : null
              })
            }
          }}
        >
          Edit
        </button>

        <dialog
          id="income-edit-from-table"
          className="edit-table"
          onClick={(event) => {
            const floorModal = document.getElementById('income-edit-from-table')
            if (event.target === floorModal) {
              floorModal.close()
            }
          }}
        >
          {selectedRow != null ? (
            <>
              <h1>Edit Entry:</h1>
              <form onSubmit={handleEditButton}>
                <label htmlFor="edit-custom-income-date">Date:</label>
                <input
                  id="edit-custom-income-date"
                  name="income_date"
                  type="date"
                  value={formState?.income_date || ''}
                  onChange={handleInputChange}
                />
                <label htmlFor="edit-custom-income-source">Income Source:</label>
                <input
                  id="edit-custom-income-source"
                  name="income_source"
                  type="text"
                  value={formState?.income_source || ''}
                  onChange={handleInputChange}
                />
                <label htmlFor="edit-custom-income-amount">Amount:</label>
                <input
                  id="edit-custom-income-amount"
                  name="income_amount"
                  type="number"
                  value={formState?.income_amount || ''}
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
                      document.getElementById('income-edit-from-table').close()
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
                  document.getElementById('income-edit-from-table').close()
                }}
              >
                Close
              </button>
            </>
          )}
        </dialog>

        <button
          onClick={() => {
            const dialog = document.getElementById('income-delete-from-table')
            if (dialog) {
              dialog.showModal()
            }
          }}
        >
          Delete
        </button>
        <dialog
          id="income-delete-from-table"
          className="delete-from-table"
          onClick={(event) => {
            const floorModal = document.getElementById('income-delete-from-table')
            if (event.target === floorModal) {
              floorModal.close()
            }
          }}
        >
          {selectedRow != null ? (
            <>
              <h2>Confirm Deletion:</h2>
              <p style={{ color: 'red' }}>
                Records of "{selectedRow.income_source}" Id:
                {selectedRow.incomeId}?
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
                    document.getElementById('income-delete-from-table').close()
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
                  document.getElementById('income-delete-from-table').close()
                }}
              >
                Close
              </button>
            </>
          )}
        </dialog>
      </div>
      {getIncomeQuery.isLoading && <div>Loading...</div>}
      {getIncomeQuery.isError && <div>Error: {getIncomeQuery.error.message}</div>}
      {getIncomeQuery.isSuccess && (
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
                      <th key={column.id} {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
                        {memoizedIncomeData && memoizedIncomeData.length > 0 && (
                          <span>{column.isSorted ? (column.isSortedDesc ? ' ↓' : ' ↑') : ''}</span>
                        )}
                      </th>
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
                          selectedRow && selectedRow.incomeId === row.original.incomeId
                            ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                            : {}
                        }
                        onClick={() =>
                          setSelectedRow(
                            selectedRow && selectedRow.incomeId === row.original.incomeId
                              ? null
                              : row.original
                          )
                        }
                      >
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()}>
                            {cell.render('Cell', { onInputChange: handleInputChange })}
                          </td>
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
            <strong>Total Income:{total_income_amount}</strong>
          </p>
        </div>
      )}
    </div>
  )
}

export default IncomeTable
