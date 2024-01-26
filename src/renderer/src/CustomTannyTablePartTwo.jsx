import React from 'react'
import './assets/CustomTannyTablePartTwo.css'
import { useTable, useSortBy } from 'react-table'

const CustomTannyTablePartTwo = ({
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
  const dateRef = React.useRef()
  const descriptionRef = React.useRef()
  const payReceiveRef = React.useRef()
  const amountRef = React.useRef()
  const editModeSaveButtonRef = React.useRef()
  const addModeSaveButtonRef = React.useRef()

  const handleEditInputChange = (rowData, originalRowData) => {
    console.log('row data', rowData)
    setEditedRow((prevRows) => {
      const existingRowIndex = prevRows.updatedRows.findIndex(
        (row) => row[typeId] === rowData[typeId]
      )

      let updatedRows
      if (existingRowIndex !== -1) {
        updatedRows = [...prevRows.updatedRows]

        updatedRows[existingRowIndex] = Object.entries(rowData).reduce(
          (acc, [key, value]) => {
            if (value !== null) {
              acc[key] = value
            }
            return acc
          },
          { ...updatedRows[existingRowIndex] }
        )
      } else {
        const newRow = Object.entries(rowData).reduce(
          (acc, [key, value]) => {
            if (value !== null) {
              acc[key] = value
            }
            return acc
          },
          { ...originalRowData }
        )

        updatedRows = [...prevRows.updatedRows, newRow]
      }

      console.log('Updated rows:', updatedRows)
      return { updatedRows }
    })
  }

  const { getTableProps, getTableBodyProps, headerGroups, footerGroups, rows, prepareRow } =
    useTable(
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
      date: dateRef.current.value,
      description: descriptionRef.current.value,
      payReceive: payReceiveRef.current.value,
      amount: amountRef.current.value
    }

    console.log('New Data', newData)
    console.log('old data', data)

    insertFunction(newData)
    // Reset refs
    dateRef.current.value = ''
    descriptionRef.current.value = ''
    payReceiveRef.current.value = ''
    amountRef.current.value = ''
  }

  const handleEditSaveClick = () => {
    setAddingMode(false)
    setEditingMode(false)
    console.log('edit mode', editedRow)
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
    <div className="CustomTannyTablePartTwo">
      <div className="CustomTannyTablePartTwo__button">
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
      <table {...getTableProps()} className="CustomTannyTablePartTwo__table">
        <thead className="CustomTannyTablePartTwo__tableHeader">
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              className="CustomTannyTablePartTwo__tableRow"
            >
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="CustomTannyTablePartTwo__tableHeaderCell"
                >
                  {column.render('Header')}
                  {/* Add a sort direction indicator */}
                  <span className="CustomTannyTablePartTwo__sortIndicator">
                    {column.isSorted ? (column.isSortedDesc ? '↑' : '↓') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="CustomTannyTablePartTwo__tableBody">
          {addingMode && (
            <tr className="CustomTannyTablePartTwo__tableRow newRow">
              <td className="CustomTannyTablePartTwo__tableCell"></td>
              <td className="CustomTannyTablePartTwo__tableCell"></td>
              <td className="CustomTannyTablePartTwo__tableCell">
                <input ref={dateRef} type="date" />
              </td>
              <td className="CustomTannyTablePartTwo__tableCell">
                <input ref={descriptionRef} type="text" />
              </td>
              <td className="CustomTannyTablePartTwo__tableCell">
                <input ref={payReceiveRef} type="text" />
              </td>
              <td className=" CustomTannyTablePartTwo__tableCell">
                <input ref={amountRef} type="number" />
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
                className="CustomTannyTablePartTwo__tableRow"
              >
                {row.cells.map((cell) => (
                  <td
                    onClick={() => {
                      setEditingMode(true)
                      setAddingMode(false)
                    }}
                    {...cell.getCellProps()}
                    className="CustomTannyTablePartTwo__tableCell"
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
        <tfoot
          className="CustomTannyTablePartTwo__tableFooter"
          style={{
            background: '#55608f'
          }}
        >
          {footerGroups.map((group) => (
            <tr
              className="CustomTannyTablePartTwo__tableFooter--Row"
              {...group.getFooterGroupProps()}
            >
              {group.headers.map((column) =>
                column.Footer ? (
                  <td {...column.getFooterProps()}>{column.render('Footer')}</td>
                ) : null
              )}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  )
}

export default CustomTannyTablePartTwo
