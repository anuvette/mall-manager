import React from 'react'
import './assets/EmployeeTable.css'
import { useTable, useSortBy } from 'react-table'

const EmployeeTable = ({
  typeId,
  data,
  columns,
  insertFunction,
  updateFunction,
  deleteFunction
}) => {
  const [activeRows, setActiveRows] = React.useState([])
  const [addingMode, setAddingMode] = React.useState(false)
  const [editingMode, setEditingMode] = React.useState(false)
  const [editedRow, setEditedRow] = React.useState({ updatedRows: [] })
  const [revertEditedRow, setRevertEditedRow] = React.useState([])
  const firstNameRef = React.useRef()
  const lastNameRef = React.useRef()
  const userNameRef = React.useRef()
  const contactRef = React.useRef()
  const emergencyContactRef = React.useRef()
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [isSuperUser, setIsSuperUser] = React.useState(false)
  const editModeSaveButtonRef = React.useRef()
  const addModeSaveButtonRef = React.useRef()

  const handleEditInputChange = (rowData, originalRowData) => {
    console.log('row data', rowData)
    setEditedRow((prevRows) => {
      // Find the index of the row in updatedRows that matches the current rowData
      const existingRowIndex = prevRows.updatedRows.findIndex(
        (row) => row[typeId] === rowData[typeId]
      )

      let updatedRows
      if (existingRowIndex !== -1) {
        // If the row already exists in updatedRows, we want to merge the new rowData with it
        // First, make a copy of updatedRows
        updatedRows = [...prevRows.updatedRows]

        // Then, for the row that matches rowData, overwrite its properties with the properties of rowData
        // But only if the new value is not null
        updatedRows[existingRowIndex] = Object.entries(rowData).reduce(
          (acc, [key, value]) => {
            // If the new value is not null, overwrite the existing value
            if (value !== null) {
              acc[key] = value
            }
            // If the new value is null, keep the existing value
            return acc
          },
          { ...updatedRows[existingRowIndex] } // Start with a copy of the existing row data
        )
      } else {
        // If the row doesn't exist in updatedRows, we want to add it
        // We start with a copy of originalRowData and overwrite its properties with the properties of rowData
        // But only if the new value is not null
        const newRow = Object.entries(rowData).reduce(
          (acc, [key, value]) => {
            // If the new value is not null, overwrite the existing value
            if (value !== null) {
              acc[key] = value
            }
            // If the new value is null, keep the existing value
            return acc
          },
          { ...originalRowData } // Start with a copy of originalRowData
        )

        // Add the new row to updatedRows
        updatedRows = [...prevRows.updatedRows, newRow]
      }

      console.log('Updated rows:', updatedRows)
      // Return the new state, which includes both updatedRows and originalRowData
      return { updatedRows }
    })
  }

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: data || [],
      autoResetSortBy: false
    },
    useSortBy // Using the useSortBy hook here
  )

  const handleAddClick = () => {
    setAddingMode((prevAddingMode) => !prevAddingMode)
    setEditingMode(false) // Reset editing mode when toggling add mode
  }

  const handleAddSaveClick = () => {
    setAddingMode(false)
    setEditingMode(false)

    const newData = {
      firstName: firstNameRef.current.value,
      lastName: lastNameRef.current.value,
      username: userNameRef.current.value,
      contact: contactRef.current.value,
      emergencyContact: emergencyContactRef.current.value,
      isAdmin: isAdmin ? 1 : 0,
      isSuperUser: isSuperUser ? 1 : 0
    }

    console.log('New Data', newData)
    console.log('old data', data)

    insertFunction(newData)
    // Reset refs
    firstNameRef.current.value = ''
    lastNameRef.current.value = ''
    userNameRef.current.value = ''
    contactRef.current.value = ''
    emergencyContactRef.current.value = ''
    setIsAdmin(false)
    setIsSuperUser(false)
  }

  const handleEditSaveClick = () => {
    setAddingMode(false)
    setEditingMode(false)
    console.log('edit mode', editedRow)

    // // Merge originalRowData with the changes in updatedRows
    // const mergedRow = Object.entries(editedRow.updatedRows[0]).reduce(
    //   (acc, [key, value]) => {
    //     // Only overwrite if the new value is not null
    //     if (value !== null) {
    //       acc[key] = value
    //     }
    //     return acc
    //   },
    //   { ...editedRow.originalRowData } // start with a copy of originalRowData
    // )

    // console.log('Merged row:', mergedRow)

    updateFunction(editedRow.updatedRows)
  }

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditingMode(false)
        setAddingMode(false)
        setActiveRows([])
        setEditedRow({ updatedRows: [] })
        // console.log('revertEditedRow', revertEditedRow)
        revertEditedRow.forEach((row) => {
          if (typeof row.ref === 'function') {
            // If it's a function, call it with the original value
            row.ref(row.original)
          } else {
            // Otherwise, set the ref's value to the original value
            row.ref.current.value = row.original // reset value
          }
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [revertEditedRow])

  const handleEscapeKeyDown = (newRef, original) => {
    setRevertEditedRow((prevRefs) => {
      const updatedRefs = [...prevRefs, { ref: newRef, original: original }]
      console.log('Updated refs:', updatedRefs)
      return updatedRefs
    })
  }

  // React.useEffect(() => {   REMOVING THE ABILITY TO DELETE ALL ACCOUNTS AT ONCE BECAUSE HONESTLY THERE IS WAYY TOO MANY EDGECASES AND I CANT TEST THEM ALL BY MYSELF
  //   const handleKeyDown = (e) => {
  //     if (e.ctrlKey && e.key === 'a') {
  //       // If there are no active rows, return early
  //       if (activeRows.length === 0 || document.activeElement.tagName === 'INPUT') {
  //         return
  //       }

  //       const firstRow = activeRows[0]
  //       e.preventDefault()

  //       if (typeId in firstRow) {
  //         setActiveRows(rows.filter((row) => typeId in row.original).map((row) => row.original))
  //       } else {
  //         return
  //       }
  //     }
  //   }

  //   window.addEventListener('keydown', handleKeyDown)

  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown)
  //   }
  // }, [rows, activeRows])

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

  return (
    <div className="EmployeeTable">
      <div className="EmployeeTable__button">
        <button
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              handleAddClick()
            }
          }}
          onClick={handleAddClick}
          style={{ fontSize: addingMode ? '45px' : '50px' }}
        >
          {addingMode ? '✕' : '+'}
        </button>
        {addingMode && (
          <button
            ref={addModeSaveButtonRef}
            onClick={handleAddSaveClick}
            style={{ fontSize: '49px' }}
          >
            &#x1F5AB;
            {/* ADD MODE SAVE BUTTON */}
          </button>
        )}
        {editingMode && (
          <>
            <button
              ref={editModeSaveButtonRef}
              onClick={handleEditSaveClick}
              style={{ fontSize: '49px' }}
            >
              &#x1F5AB;
            </button>
            {/* EDIT MODE SAVE BUTTON */}
            <button
              onClick={() => {
                let x = activeRows.map((row) => row[typeId])
                console.log(x)
                deleteFunction(activeRows.map((row) => row[typeId]))
                setEditingMode(false)
              }}
              style={{ color: 'red' }}
            >
              &#x1F5D1;
            </button>{' '}
            {/* Delete BUTTON */}
          </>
        )}
        {editingMode || addingMode ? (
          <p style={{ alignSelf: 'center', color: 'darkgray' }}>
            Press Esc to revert back(Twice for Date)
          </p>
        ) : (
          ''
        )}
      </div>
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
                <input ref={firstNameRef} type="text" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={lastNameRef} type="text" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={userNameRef} type="text" required />
              </td>
              <td className="EmployeeTable__tableCell">
                <input style={{ cursor: 'not-allowed' }} type="text" disabled />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={contactRef} type="number" />
              </td>
              <td className="EmployeeTable__tableCell">
                <input ref={emergencyContactRef} type="number" />
              </td>
              <td style={{ border: '1px solid white' }} className="AdvancesTable__tableCell">
                <label>
                  <input
                    style={{ border: '1px solid white' }}
                    type="checkbox"
                    checked={isAdmin}
                    onChange={() => {
                      const newisAdmin = !isAdmin
                      setIsAdmin(newisAdmin)
                      console.log(`Checkbox clicked. New value: ${newisAdmin ? 1 : 0}`)
                    }}
                  />
                  <p
                    style={{
                      color: isAdmin ? '#14b8a6' : 'hsl(0, 100%, 50%)'
                    }}
                  >
                    {isAdmin ? 'Yes' : 'No'}
                  </p>
                </label>
              </td>
              <td style={{ border: '1px solid white' }} className="AdvancesTable__tableCell">
                <label>
                  <input
                    style={{ border: '1px solid white' }}
                    type="checkbox"
                    checked={isSuperUser}
                    onChange={() => {
                      const newIsSuperUser = !isSuperUser
                      setIsSuperUser(newIsSuperUser)
                      console.log(`Checkbox clicked. New value: ${newIsSuperUser ? 1 : 0}`)
                    }}
                  />
                  <p
                    style={{
                      color: isSuperUser ? '#14b8a6' : 'hsl(0, 100%, 50%)'
                    }}
                  >
                    {isSuperUser ? 'Yes' : 'No'}
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
                  >
                    {cell.render('Cell', {
                      onInputChange: handleEditInputChange,
                      onEscapeKeyDown: handleEscapeKeyDown
                    })}
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
