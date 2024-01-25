import React from 'react'
import './assets/RepairMaintainance.css'
import { useTable, useSortBy } from 'react-table'

const RepairMaintainanceTable = ({
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
  const facilityTypeRef = React.useRef()
  const providerNameRef = React.useRef()
  const contractStartRef = React.useRef()
  const contractEndRef = React.useRef()
  const contractCostRef = React.useRef()
  const servicesRef = React.useRef()
  const frequencyRef = React.useRef()
  const contactInformationRef = React.useRef()
  const estimatedChargeRef = React.useRef()
  const statusRef = React.useRef()
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
      facilityType: facilityTypeRef.current.value,
      providerName: providerNameRef.current.value,
      contractStart: contractStartRef.current.value,
      contractEnd: contractEndRef.current.value,
      contractCost: contractCostRef.current.value,
      services: servicesRef.current.value,
      frequency: frequencyRef.current.value,
      contactInformation: contactInformationRef.current.value,
      estimatedCharge: estimatedChargeRef.current.value,
      status: statusRef.current.value
    }

    console.log('New Data', newData)
    console.log('old data', data)

    insertFunction(newData)
    // Reset refs
    facilityTypeRef.current.value = ''
    providerNameRef.current.value = ''
    contractStartRef.current.value = ''
    contractEndRef.current.value = ''
    contractCostRef.current.value = ''
    servicesRef.current.value = ''
    frequencyRef.current.value = ''
    contactInformationRef.current.value = ''
    estimatedChargeRef.current.value = ''
    statusRef.current.value = ''
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

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'a') {
        // If there are no active rows, return early
        if (activeRows.length === 0 || document.activeElement.tagName === 'INPUT') {
          return
        }

        const firstRow = activeRows[0]
        e.preventDefault()

        if (typeId in firstRow) {
          setActiveRows(rows.filter((row) => typeId in row.original).map((row) => row.original))
        } else {
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [rows, activeRows])

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
    <div className="RepairMaintainanceTable">
      <div className="RepairMaintainanceTable__button">
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
      <table {...getTableProps()} className="RepairMaintainanceTable__table">
        <thead className="RepairMaintainanceTable__tableHeader">
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              className="RepairMaintainanceTable__tableRow"
            >
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="RepairMaintainanceTable__tableHeaderCell"
                >
                  {column.render('Header')}
                  {/* Add a sort direction indicator */}
                  <span className="RepairMaintainanceTable__sortIndicator">
                    {column.isSorted ? (column.isSortedDesc ? '↑' : '↓') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="RepairMaintainanceTable__tableBody">
          {addingMode && (
            <tr className="RepairMaintainanceTable__tableRow newRow">
              <td className="RepairMaintainanceTable__tableCell"></td>
              <td className="RepairMaintainanceTable__tableCell"></td>
              <td className="RepairMaintainanceTable__tableCell">
                <input ref={facilityTypeRef} type="text" />
              </td>
              <td className="RepairMaintainanceTable__tableCell">
                <input ref={providerNameRef} type="text" />
              </td>
              <td className="RepairMaintainanceTable__tableCell">
                <input ref={contractStartRef} type="date" />
              </td>
              <td className="RepairMaintainanceTable__tableCell">
                <input ref={contractEndRef} type="date" />
              </td>
              <td className="RepairMaintainanceTable__tableCell">
                <input ref={contractCostRef} type="number" />
              </td>
              <td className="RepairMaintainanceTable__tableCell">
                <input ref={servicesRef} type="text" />
              </td>
              <td className="RepairMaintainanceTable__tableCell">
                <input ref={frequencyRef} type="text" />
              </td>
              <td className="RepairMaintainanceTable__tableCell">
                <input ref={contactInformationRef} type="number" />
              </td>
              <td className="RepairMaintainanceTable__tableCell">
                <input ref={estimatedChargeRef} type="number" />
              </td>
              <td className="RepairMaintainanceTable__tableCell">
                <input ref={statusRef} type="text" />
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
                className="RepairMaintainanceTable__tableRow"
              >
                {row.cells.map((cell) => (
                  <td
                    onClick={() => {
                      setEditingMode(true)
                      setAddingMode(false)
                    }}
                    {...cell.getCellProps()}
                    className="RepairMaintainanceTable__tableCell"
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

export default RepairMaintainanceTable
