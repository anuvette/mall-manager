import React, { useState, useEffect, useRef, useMemo } from 'react'
import './assets/EmployeeTable.css'
import { useTable, useSortBy, useFilters } from 'react-table'

function CustomCheckbox({ value, onChange }) {
  const [isChecked, setIsChecked] = useState(value === 1)

  const handleClick = () => {
    setIsChecked(!isChecked)
    onChange(!isChecked ? 1 : 0)
  }

  return (
    <button
      style={{
        background: 'transparent',
        border: '1px solid white',
        borderRadius: 0,
        width: '100%',
        color: isChecked ? '#14b8a6' : 'hsl(0, 100%, 50%)'
      }}
      onClick={handleClick}
    >
      {isChecked ? 'Yes' : 'No'}
    </button>
  )
}

const AdvancesTable = ({ typeId, data, insertFunction, updateFunction, deleteFunction }) => {
  const [activeRows, setActiveRows] = useState([])
  const [addingMode, setAddingMode] = useState(false)
  const [editingMode, setEditingMode] = useState(false)
  const [filterInput, setFilterInput] = useState('')

  const addModeRefs = {
    amount: useRef(),
    recipient: useRef(),
    dateIssued: useRef(),
    dateSettled: useRef()
  }

  const [checkBoxStates, setCheckBoxStates] = useState({
    status: false
  })

  const [changes, setChanges] = useState([])

  const editModeSaveButtonRef = useRef()
  const addModeSaveButtonRef = useRef()

  const columns = useMemo(
    () => [
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
        accessor: 'amount'
      },
      {
        Header: 'Recipient',
        accessor: 'recipient',
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
        accessor: 'dateIssued'
      },
      {
        Header: 'Date Settled',
        accessor: 'dateSettled'
      },
      {
        Header: 'Status',
        accessor: 'status'
      }
    ],
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    prepareRow,
    setFilter
  } = useTable(
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
    setFilter('recipient', value)
    setFilterInput(value)
  }

  const handleAddSaveClick = () => {
    setAddingMode(false)
    setEditingMode(false)
    setActiveRows([])
    setChanges([])

    const newData = {
      amount: addModeRefs.amount.current.value,
      recipient: addModeRefs.recipient.current.value,
      dateIssued: addModeRefs.dateIssued.current.value,
      dateSettled: addModeRefs.dateSettled.current.value,
      status: checkBoxStates.status ? 1 : 0
    }

    console.log('New Data', newData)
    console.log('old data', data)

    insertFunction.mutate(newData)

    addModeRefs.amount.current.value = ''
    addModeRefs.recipient.current.value = ''
    addModeRefs.dateIssued.current.value = ''
    addModeRefs.dateSettled.current.value = ''
    setCheckBoxStates((prevState) => ({
      ...prevState,
      status: false
    }))
  }

  React.useEffect(() => {
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

    if (addingMode) {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          addModeSaveButtonRef.current.click()
        }
      }

      window.addEventListener('keydown', handleKeyDown)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [editingMode, addingMode])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditingMode(false)
        setAddingMode(false)
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
          placeholder={'Search by Recipient Name'}
        />
        <button
          onClick={() => {
            setAddingMode((prevAddingMode) => !prevAddingMode)

            setEditingMode(false)
          }}
          style={{ fontSize: '50px' }}
        >
          +
        </button>
        <button
          onClick={() => {
            setEditingMode((prevEditingMode) => !prevEditingMode)
            setAddingMode(false)
          }}
          style={{ fontSize: '45px' }}
        >
          &#9998; {/* EDIT BUTTON */}
        </button>
        {addingMode && (
          <>
            <button
              ref={addModeSaveButtonRef}
              onClick={handleAddSaveClick}
              style={{ fontSize: '49px' }}
            >
              &#x1F5AB;
              {/* ADD MODE SAVE BUTTON */}
            </button>
          </>
        )}
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
        {(editingMode || addingMode) && (
          <p style={{ alignSelf: 'center', color: 'darkgray' }}>Press Esc to revert back.</p>
        )}

        {/* ERROR BLOCK */}
      </div>
      {insertFunction.isError && (
        <div style={{ color: 'red' }}>
          An error occurred while inserting: {insertFunction.error.message}
        </div>
      )}
      {updateFunction.isError && (
        <div style={{ color: 'red' }}>
          An error occurred while updating: {updateFunction.error.message}
        </div>
      )}
      {deleteFunction.isError && (
        <div style={{ color: 'red' }}>
          An error occurred while deleting: {deleteFunction.error.message}
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
          {addingMode && (
            <tr className="EmployeeTable__tableRow newRow">
              <td className="EmployeeTable__tableCell"></td>
              <td className="EmployeeTable__tableCell"></td>
              <td className="EmployeeTable__tableCell">
                <input ref={addModeRefs.amount} type="number" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={addModeRefs.recipient} type="text" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={addModeRefs.dateIssued} type="date" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={addModeRefs.dateSettled} type="date" />
              </td>
              <td style={{ border: '1px solid white' }} className="EmployeeTable__tableCell">
                <label>
                  <input
                    style={{ border: '1px solid white' }}
                    type="checkbox"
                    checked={checkBoxStates.status}
                    onChange={() => {
                      setCheckBoxStates((prevState) => ({
                        ...prevState,
                        status: !prevState.status
                      }))
                      console.log(`Checkbox clicked. New value: ${checkBoxStates.status ? 1 : 0}`)
                    }}
                  />
                  <p
                    style={{
                      color: checkBoxStates.status ? '#14b8a6' : 'hsl(0, 100%, 50%)'
                    }}
                  >
                    {checkBoxStates.status ? 'Yes' : 'No'}
                  </p>
                </label>
              </td>
            </tr>
          )}
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
                      setAddingMode(false)
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
                      ['status'].includes(cell.column.id) ? (
                        <CustomCheckbox
                          value={cell.value}
                          onChange={(newValue) => {
                            const newChanges = [...changes]
                            const changeIndex = newChanges.findIndex(
                              (change) => change[typeId] === row.original[typeId]
                            )
                            if (changeIndex !== -1) {
                              newChanges[changeIndex] = {
                                ...newChanges[changeIndex],
                                [cell.column.id]: newValue
                              }
                            } else {
                              newChanges.push({
                                [typeId]: row.original[typeId],
                                [cell.column.id]: newValue
                              })
                            }
                            setChanges(newChanges)
                            console.log('Edit Changes fella', newChanges) // Log the changes to the console
                          }}
                        />
                      ) : (
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
                              : ['dateIssued', 'dateSettled'].includes(cell.column.id)
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
                      )
                    ) : ['status'].includes(cell.column.id) ? (
                      <span style={{ color: cell.value === 1 ? '#14b8a6' : 'hsl(0, 100%, 50%)' }}>
                        {cell.value === 1 ? 'Yes' : 'No'}
                      </span>
                    ) : (
                      cell.render('Cell')
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
        <tfoot
          style={{
            border: '2px solid white',
            height: '49px',
            position: 'relative'
          }}
        >
          {footerGroups.map((group) => (
            <tr {...group.getFooterGroupProps()}>
              {group.headers.map((column) => (
                <td
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                  {...column.getFooterProps()}
                >
                  {column.render('Footer')}
                </td>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  )
}

export default AdvancesTable
