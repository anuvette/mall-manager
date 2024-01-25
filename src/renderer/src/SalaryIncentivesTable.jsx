import React from 'react'
import './assets/EmployeeTable.css'
import { useTable, useSortBy } from 'react-table'

const SalaryIncentivesTable = ({ typeId, data, columns, updateFunction }) => {
  const [activeRows, setActiveRows] = React.useState([])
  const [editingMode, setEditingMode] = React.useState(false)
  const [editedRow, setEditedRow] = React.useState({ updatedRows: [] })
  const [revertEditedRow, setRevertEditedRow] = React.useState([])

  const editModeSaveButtonRef = React.useRef()

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

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: data || [],
      autoResetSortBy: false
    },
    useSortBy // Using the useSortBy hook here
  )

  const handleEditSaveClick = () => {
    setEditingMode(false)
    console.log('edit mode', editedRow)
    updateFunction(editedRow.updatedRows)
  }

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditingMode(false)
        setActiveRows([])
        setEditedRow([])
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

  return (
    <div className="EmployeeTable">
      <div className="EmployeeTable__button">
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
          </>
        )}
        {editingMode ? (
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
          {rows.map((row) => {
            prepareRow(row)
            return (
              <tr
                {...row.getRowProps()}
                key={row.original.userid} // Add this line
                style={
                  activeRows.find((activeRow) => activeRow.userid === row.original.userid)
                    ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                    : {}
                }
                onClick={(e) => {
                  setActiveRows([row.original])
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

export default SalaryIncentivesTable
