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

const EmployeeTable = ({ typeId, data, insertFunction, updateFunction, deleteFunction }) => {
  const [activeRows, setActiveRows] = useState([])
  const [addingMode, setAddingMode] = useState(false)
  const [editingMode, setEditingMode] = useState(false)
  const [filterInput, setFilterInput] = useState('')

  const addModeRefs = {
    firstName: useRef(),
    lastName: useRef(),
    userName: useRef(),
    contact: useRef(),
    secondaryContact: useRef()
  }
  const [checkBoxStates, setCheckBoxStates] = useState({
    isAdmin: false,
    isSuperUser: false
  })

  const [changes, setChanges] = useState([])

  const editModeSaveButtonRef = useRef()
  const addModeSaveButtonRef = useRef()

  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'userid'
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
        Header: 'Password',
        accessor: 'password'
      },
      {
        Header: 'Contact',
        accessor: 'contact'
      },

      {
        Header: 'Contact 2',
        accessor: 'secondaryContact'
      },
      {
        Header: 'isAdmin',
        accessor: 'isAdmin'
      },
      {
        Header: 'isSuperUser',
        accessor: 'isSuperUser'
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
    setFilter('firstName', value) // Update the name filter. Now our table will filter by the name column
    setFilterInput(value)
  }

  const handleAddSaveClick = () => {
    setAddingMode(false)
    setEditingMode(false)
    setActiveRows([])
    setChanges([])

    const newData = {
      firstName: addModeRefs.firstName.current.value,
      lastName: addModeRefs.lastName.current.value,
      username: addModeRefs.userName.current.value,
      contact: addModeRefs.contact.current.value,
      secondaryContact: addModeRefs.secondaryContact.current.value,
      isAdmin: checkBoxStates.isAdmin ? 1 : 0,
      isSuperUser: checkBoxStates.isSuperUser ? 1 : 0
    }

    console.log('New Data', newData)
    console.log('old data', data)

    insertFunction.mutate(newData)
    // Reset refs
    addModeRefs.firstName.current.value = ''
    addModeRefs.lastName.current.value = ''
    addModeRefs.userName.current.value = ''
    addModeRefs.contact.current.value = ''
    addModeRefs.secondaryContact.current.value = ''
    setCheckBoxStates((prevState) => ({
      ...prevState,
      isAdmin: false,
      isSuperUser: false
    }))
  }

  React.useEffect(() => {
    if (editingMode) {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          console.log('hello form enter keydown')
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

  React.useEffect(() => {
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
          placeholder={'Search by First Name'}
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
          <p style={{ alignSelf: 'center', color: 'darkgray' }}>
            Press Esc to revert back. [Ctrl+A Disabled for Security]
          </p>
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
                <input ref={addModeRefs.firstName} type="text" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={addModeRefs.lastName} type="text" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={addModeRefs.userName} type="text" required />
              </td>
              <td className="EmployeeTable__tableCell">
                <input style={{ cursor: 'not-allowed' }} type="text" disabled />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={addModeRefs.contact} type="number" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={addModeRefs.secondaryContact} type="number" />
              </td>
              <td style={{ border: '1px solid white' }} className="EmployeeTable__tableCell">
                <label>
                  <input
                    style={{ border: '1px solid white' }}
                    type="checkbox"
                    checked={checkBoxStates.isAdmin}
                    onChange={() => {
                      setCheckBoxStates((prevState) => ({
                        ...prevState,
                        isAdmin: !prevState.isAdmin
                      }))
                      console.log(`Checkbox clicked. New value: ${checkBoxStates.isAdmin ? 1 : 0}`)
                    }}
                  />
                  <p
                    style={{
                      color: checkBoxStates.isAdmin ? '#14b8a6' : 'hsl(0, 100%, 50%)'
                    }}
                  >
                    {checkBoxStates.isAdmin ? 'Yes' : 'No'}
                  </p>
                </label>
              </td>
              <td style={{ border: '1px solid white' }} className="EmployeeTable__tableCell">
                <label>
                  <input
                    style={{ border: '1px solid white' }}
                    type="checkbox"
                    checked={checkBoxStates.isSuperUser}
                    onChange={() => {
                      setCheckBoxStates((prevState) => ({
                        ...prevState,
                        isSuperUser: !prevState.isSuperUser
                      }))
                      console.log(
                        `Checkbox clicked. New value: ${checkBoxStates.isSuperUser ? 1 : 0}`
                      )
                    }}
                  />
                  <p
                    style={{
                      color: checkBoxStates.isSuperUser ? '#14b8a6' : 'hsl(0, 100%, 50%)'
                    }}
                  >
                    {checkBoxStates.isSuperUser ? 'Yes' : 'No'}
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
                    {editingMode && !['userid', 'sn', 'password'].includes(cell.column.id) ? (
                      ['isAdmin', 'isSuperUser'].includes(cell.column.id) ? (
                        <CustomCheckbox
                          value={cell.value}
                          onChange={(newValue) => {
                            const newChanges = [...changes]
                            const changeIndex = newChanges.findIndex(
                              (change) => change.userid === row.original.userid
                            )
                            if (changeIndex !== -1) {
                              newChanges[changeIndex] = {
                                ...newChanges[changeIndex],
                                [cell.column.id]: newValue
                              }
                            } else {
                              newChanges.push({
                                userid: row.original.userid,
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
                          type="text"
                          defaultValue={cell.value}
                          onChange={(e) => {
                            const newChanges = [...changes]
                            const changeIndex = newChanges.findIndex(
                              (change) => change.userid === row.original.userid
                            )
                            if (changeIndex !== -1) {
                              newChanges[changeIndex] = {
                                ...newChanges[changeIndex],
                                [cell.column.id]: e.target.value
                              }
                            } else {
                              newChanges.push({
                                userid: row.original.userid,
                                [cell.column.id]: e.target.value
                              })
                            }
                            setChanges(newChanges)
                            console.log(newChanges) // Log the changes to the console
                          }}
                        />
                      )
                    ) : ['isAdmin', 'isSuperUser'].includes(cell.column.id) ? (
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
      </table>
    </div>
  )
}

export default EmployeeTable
