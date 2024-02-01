import React, { useState, useEffect, useRef, useMemo } from 'react'
import './assets/EmployeeTable.css'
import { useTable, useSortBy, useFilters } from 'react-table'

const SalaryIncentivesTable = ({ typeId, data, updateFunction }) => {
  const [activeRows, setActiveRows] = useState([])
  const [editingMode, setEditingMode] = useState(false)
  const [filterInput, setFilterInput] = useState('')

  const addModeRefs = {
    date: useRef(),
    description: useRef(),
    [typeId === 'payableId' ? 'payable_to' : 'receivable_from']: useRef(),
    amount: useRef()
  }

  const [changes, setChanges] = useState([])

  const editModeSaveButtonRef = useRef()

  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: typeId
      },
      {
        Header: 'SN',
        accessor: 'sn',
        Cell: ({ row }) => {
          return <div>{row.index + 1}</div>
        }
      },
      {
        Header: 'First Name',
        accessor: 'firstName'
      },
      {
        Header: 'Last Name',
        accessor: 'lastName'
      },
      {
        Header: 'Username',
        accessor: 'username'
      },

      {
        Header: 'Base Salary',
        accessor: 'base_salary'
      },
      {
        Header: 'Bonus',
        accessor: 'bonus'
      },
      {
        Header: 'Incentives',
        accessor: 'incentives'
      }
    ],
    []
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, setFilter } = useTable(
    {
      columns,
      data: data || [],
      autoResetSortBy: false
    },
    useFilters,
    useSortBy // Using the useSortBy hook here
  )

  const handleFilterChange = (e) => {
    const value = e.target.value || undefined
    setFilter('description', value)
    setFilterInput(value)
  }

  useEffect(() => {
    if (editingMode) {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          editModeSaveButtonRef.current.click()
        }
      }

      window.addEventListener('keydown', handleKeyDown)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [editingMode])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditingMode(false)
        setActiveRows([])
        setChanges([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingMode && e.ctrlKey && e.key === 'a') {
        if (e.target instanceof HTMLInputElement) {
          return
        }

        e.preventDefault()
        setActiveRows(rows.map((row) => row.original))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [rows, editingMode])

  return (
    <div className="EmployeeTable">
      <div className="EmployeeTable__button">
        <input
          style={{
            border: '1px solid white',
            borderRadius: 0,
            backgroundColor: 'transparent',
            color: 'white'
          }}
          value={filterInput}
          onChange={handleFilterChange}
          placeholder={'Search by Description Name'}
        />
        <button
          onClick={() => {
            setEditingMode((prevEditingMode) => !prevEditingMode)
          }}
          style={{ fontSize: '45px' }}
        >
          &#9998; {/* EDIT BUTTON */}
        </button>
        {editingMode && (
          <>
            <button
              ref={editModeSaveButtonRef}
              onClick={() => {
                updateFunction.mutate(changes)

                setEditingMode(false)
              }}
              style={{ fontSize: '49px' }}
            >
              &#x1F5AB; {/* EDIT MODE SAVE BUTTON */}
            </button>
            <button
              onClick={() => {
                let x = activeRows.map((row) => row[typeId])
                console.log(x)
                deleteFunction.mutate(activeRows.map((row) => row[typeId]))
                setEditingMode(false)
              }}
              style={{ color: 'red' }}
            >
              &#x1F5D1;
              {/* Delete BUTTON */}
            </button>
          </>
        )}
        {editingMode && (
          <p style={{ alignSelf: 'center', color: 'darkgray' }}>Press Esc to revert back.</p>
        )}

        {/* ERROR BLOCK */}
      </div>

      {updateFunction.isError && (
        <div style={{ color: 'red' }}>
          An error occurred while updating: {updateFunction.error.message}
        </div>
      )}

      {/* ERROR BLOCK END */}

      <table {...getTableProps()} className="EmployeeTable__table">
        <thead className="EmployeeTable__tableHeader">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} className="EmployeeTable__tableRow">
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="EmployeeTable__tableHeaderCell"
                >
                  {column.render('Header')}
                  {/* Add a sort direction indicator */}
                  <span className="EmployeeTable__sortIndicator">
                    {column.isSorted ? (column.isSortedDesc ? '↑' : '↓') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="EmployeeTable__tableBody">
          {rows.map((row) => {
            prepareRow(row)
            return (
              <tr
                {...row.getRowProps()}
                key={row.original[typeId]} // Add this line
                style={
                  activeRows.find((activeRow) => activeRow[typeId] === row.original[typeId])
                    ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                    : {}
                }
                onClick={(e) => {
                  if (e.ctrlKey) {
                    // If ctrl was pressed, add the row to the active rows
                    setActiveRows((prevRows) => [...prevRows, row.original])
                  } else {
                    // If ctrl wasn't pressed, set the active row to just this row
                    setActiveRows([row.original])
                  }
                }}
                className="EmployeeTable__tableRow"
              >
                {row.cells.map((cell) => (
                  <td
                    onClick={() => {
                      setEditingMode(true)
                    }}
                    {...cell.getCellProps()}
                    className="EmployeeTable__tableCell"
                    style={{
                      padding: editingMode ? '0px' : '10px',
                      maxWidth: '100px',
                      overflow: 'scroll', // Add this line
                      cursor: cell.column.id === 'password' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {editingMode && ![typeId, 'sn'].includes(cell.column.id) ? (
                      <input
                        style={{
                          border: '1px solid white',
                          borderRadius: 0,
                          cursor: 'pointer'
                        }}
                        className="EmployeeTable__input--EditMode"
                        type={
                          cell.column.id === 'amount'
                            ? 'number'
                            : cell.column.id === 'date'
                              ? 'date'
                              : 'text'
                        }
                        defaultValue={cell.value}
                        onChange={(e) => {
                          const newChanges = [...changes]
                          const changeIndex = newChanges.findIndex(
                            (change) => change[typeId] === row.original[typeId]
                          )
                          if (changeIndex !== -1) {
                            newChanges[changeIndex] = {
                              ...newChanges[changeIndex],
                              [cell.column.id]: e.target.value
                            }
                          } else {
                            newChanges.push({
                              [typeId]: row.original[typeId],
                              [cell.column.id]: e.target.value
                            })
                          }
                          setChanges(newChanges)
                          console.log(newChanges) // Log the changes to the console
                        }}
                      />
                    ) : (
                      cell.render('Cell')
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default SalaryIncentivesTable
