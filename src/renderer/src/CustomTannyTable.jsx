import React, { useState, useEffect, useRef, useMemo } from 'react'
import './assets/EmployeeTable.css'
import { useTable, useSortBy, useFilters } from 'react-table'
import { AnimatePresence, motion } from 'framer-motion'

const CustomTannyTable = ({ typeId, data, insertFunction, updateFunction, deleteFunction }) => {
  const [activeRows, setActiveRows] = useState([])
  const [addingMode, setAddingMode] = useState(false)
  const [editingMode, setEditingMode] = useState(false)
  const [filterInput, setFilterInput] = useState('')

  const addModeRefs = {
    date: useRef(),
    description: useRef(),
    amount: useRef()
  }

  const [changes, setChanges] = useState([])

  const editModeSaveButtonRef = useRef()
  const addModeSaveButtonRef = useRef()

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
        Header: 'Date',
        accessor: 'date'
      },
      {
        Header: 'Description',
        accessor: 'description',
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
        accessor: 'amount'
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
    setFilter('description', value)
    setFilterInput(value)
  }

  const handleAddSaveClick = () => {
    setAddingMode(false)
    setEditingMode(false)
    setActiveRows([])
    setChanges([])

    const newData = {
      date: addModeRefs.date.current.value,
      amount: addModeRefs.amount.current.value,
      description: addModeRefs.description.current.value
    }

    console.log('New Data', newData)
    console.log('old data', data)

    insertFunction.mutate(newData)

    addModeRefs.date.current.value = ''
    addModeRefs.amount.current.value = ''
    addModeRefs.description.current.value = ''
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
          placeholder={'Search by Description Name'}
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
                // console.log(x)
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
                <input ref={addModeRefs.date} type="date" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={addModeRefs.description} type="text" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={addModeRefs.amount} type="number" />
              </td>
            </tr>
          )}
          <AnimatePresence>
            {rows.map((row) => {
              prepareRow(row)
              return (
                <motion.tr
                  initial={{ y: -30 }}
                  animate={{ y: 0, transition: { type: 'spring', stiffness: 200, damping: 10 } }}
                  exit={{ opacity: 0, y: -30, transition: { type: 'tween', duration: 0.2 } }}
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
                </motion.tr>
              )
            })}
          </AnimatePresence>
        </tbody>
        <tfoot style={{ background: '#55608f' }}>
          {footerGroups.map((group) => (
            <tr {...group.getFooterGroupProps()}>
              {group.headers.map((column) => (
                <td {...column.getFooterProps()}>{column.render('Footer')}</td>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  )
}

export default CustomTannyTable
