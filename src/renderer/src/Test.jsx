import React from 'react'
import './assets/Test.css'
import { useTable, useSortBy } from 'react-table'

const data = [
  {
    id: '01',
    date: '2022-01-01',
    description: 'Office supplies',
    amount: 50.0,
    balance: 950.0
  },
  {
    id: '02',
    date: '2022-01-02',
    description: 'Coffee for meeting',
    amount: 30.0,
    balance: 920.0
  },
  {
    id: '03',
    date: '2022-01-03',
    description: 'Postage',
    amount: 10.0,
    balance: 910.0
  },
  {
    id: '04',
    date: '2022-01-04',
    description: 'Printer ink',
    amount: 40.0,
    balance: 870.0
  }
]

const Test = () => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id'
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
        accessor: 'date',
        Cell: ({ cell: { value } }) => {
          const [inputValue, setInputValue] = React.useState(value)

          const handleInputChange = (e) => {
            setInputValue(e.target.value)
          }

          return <input type="date" value={inputValue} onChange={handleInputChange} />
        }
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ cell: { value } }) => {
          const [inputValue, setInputValue] = React.useState(value)

          const handleInputChange = (e) => {
            setInputValue(e.target.value)
          }

          return <input value={inputValue} onChange={handleInputChange} />
        }
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        Cell: ({ cell: { value }, row: { original } }) => {
          const [inputValue, setInputValue] = React.useState(value)

          const handleInputChange = (e) => {
            setInputValue(e.target.value)
          }

          const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
              setInputValue(original.amount) // revert to original value
            }
          }

          return (
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
          )
        }
      },
      {
        Header: 'Balance',
        accessor: 'balance',
        Cell: ({ cell: { value } }) => {
          const [inputValue, setInputValue] = React.useState(value)

          const handleInputChange = (e) => {
            setInputValue(e.target.value)
          }

          return <input type="number" value={inputValue} onChange={handleInputChange} />
        }
      }
    ],
    []
  )

  const [employeeData, setEmployeeData] = React.useState(data)
  const [addingMode, setAddingMode] = React.useState(false)
  const [editingMode, setEditingMode] = React.useState(false)
  const [newRow, setNewRow] = React.useState({
    id: '',
    date: '',
    description: '',
    amount: '',
    balance: ''
  })

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: employeeData
    },
    useSortBy // Using the useSortBy hook here
  )

  const handleAddClick = () => {
    if (addingMode) {
      //adding mode true cha bhane obviously aaba false hune wala chha tei bhayera pop gareko ho
      setEmployeeData((old) => {
        const newData = [...old]
        if (newData[newData.length - 1] === newRow) {
          newData.pop()
        }
        return newData
      })
      setAddingMode(false)
      setEditingMode(false)
    } else {
      // If we're not in adding mode, create a new row and store it in the newRow state
      setEmployeeData((old) => [...old, newRow])
      setAddingMode(true)
      setEditingMode(true)
    }
  }

  const handleSaveClick = () => {
    setEmployeeData((old) => {
      const newData = [...old]
      if (newData[newData.length - 1] === newRow) {
        newData.pop()
      }
      return newData
    })
    setAddingMode(false)
    setEditingMode(false)
    console.log(employeeData)
  }

  return (
    <div className="pettyCashAccount">
      <h1 className="pettyCashAccount__title">ReactJS Editable Table</h1>
      <div className="pettyCashAccount__button">
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
        {editingMode && (
          <button onClick={handleSaveClick} style={{ fontSize: '49px' }}>
            &#x1F5AB;
          </button>
        )}
        {editingMode || addingMode ? (
          <p style={{ alignSelf: 'center', color: 'gray' }}>
            Press Esc to revert back(Twice for Date)
          </p>
        ) : (
          ''
        )}
      </div>
      <table {...getTableProps()} className="pettyCashAccount__table">
        <thead className="pettyCashAccount__tableHeader">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} className="pettyCashAccount__tableRow">
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="pettyCashAccount__tableHeaderCell"
                >
                  {column.render('Header')}
                  {/* Add a sort direction indicator */}
                  <span className="pettyCashAccount__sortIndicator">
                    {column.isSorted ? (column.isSortedDesc ? '↑' : '↓') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="pettyCashAccount__tableBody">
          {rows.map((row) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()} className="pettyCashAccount__tableRow">
                {row.cells.map((cell) => (
                  <td
                    tabIndex={0} // make the td focusable
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEditingMode(false)
                      }
                    }}
                    onClick={() => setEditingMode(true)}
                    {...cell.getCellProps()}
                    className={`pettyCashAccount__tableCell ${
                      addingMode && row.original === newRow ? 'newRow' : ''
                    }`}
                  >
                    {cell.render('Cell')}
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

export default Test
