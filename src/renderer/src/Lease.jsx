import './assets/Lease.css'
import { useTable } from 'react-table'
import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function Lease() {
  const [selectedRow, setSelectedRow] = useState(null)
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    emergencyContact: '',
    spaceRenting: '',
    floorNumber: '',
    PANNumber: '',
    citizenshipNumber: '',
    dateOfEffect: '',
    dateOfExpiry: '',
    userName: ''
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const leaseQuery = useQuery({
    queryKey: ['leaseData'],
    queryFn: () => window.electronAPI.getLeaseTableDetails()
    // refetchOnWindowFocus: false,
  })

  const addLeaseMutation = useMutation({
    mutationFn: (leaseData) => window.electronAPI.addNewLease(leaseData),
    onSuccess: () => {
      //console.log("Lease added successfully");
      queryClient.invalidateQueries(['leaseData'])
    }
  })

  const editLeaseMutation = useMutation({
    mutationFn: (leaseData) => window.electronAPI.editExistingLease(leaseData),
    onSuccess: () => {
      console.log('Lease edited successfully')
      queryClient.invalidateQueries(['leaseData'])
    }
  })

  const deleteLeaseMutation = useMutation({
    mutationFn: (leaseId) => window.electronAPI.deleteLease(leaseId),
    onSuccess: () => {
      console.log('Lease deleted successfully')
      queryClient.invalidateQueries(['leaseData'])
    }
  })

  const leaseTableData = React.useMemo(() => leaseQuery.data, [leaseQuery.data])
  const columns = React.useMemo(
    () => [
      {
        Header: 'SN',
        accessor: 'sn', // this accessor is just a placeholder we arent getting it from a database
        Cell: ({ row: { index } }) => index + 1
      },
      {
        Header: 'ID',
        accessor: 'leaseId'
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
        Header: 'Contact',
        accessor: 'contact'
      },
      {
        Header: 'Emergency Contact',
        accessor: 'emergencyContact'
      },
      {
        Header: 'Space Renting',
        accessor: 'spaceRenting'
      },
      {
        Header: 'Floor Number',
        accessor: 'floorNumber'
      },
      {
        Header: 'PAN',
        accessor: 'PANNumber'
      },
      {
        Header: 'Citizenship',
        accessor: 'citizenshipNumber'
      },
      {
        Header: 'Date of Effect',
        accessor: 'dateOfEffect'
      },
      {
        Header: 'Date of Expiry',
        accessor: 'dateOfExpiry'
      },
      {
        Header: 'username',
        accessor: 'userName'
      }
    ],
    []
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: leaseTableData || []
  }) //react-query is asynchronous but this table needs to be rendered synchronously so thats why passing empty array as data to useTable because it cant run withh null value

  const handleInputChange = (event) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value
    })
  }

  const handleAddButton = (event) => {
    event.preventDefault()

    console.log('User Input:', formState)

    addLeaseMutation.mutate(formState)

    setFormState({
      firstName: '',
      lastName: '',
      contact: '',
      emergencyContact: '',
      spaceRenting: '',
      floorNumber: '',
      PANNumber: '',
      citizenshipNumber: '',
      dateOfEffect: '',
      dateOfExpiry: '',
      userName: ''
    })
  }

  const handleEditOpen = () => {
    const dialog = document.getElementById('edit-table')
    if (dialog && selectedRow) {
      dialog.showModal()

      setFormState({
        firstName: selectedRow.firstName,
        lastName: selectedRow.lastName,
        contact: selectedRow.contact,
        emergencyContact: selectedRow.emergencyContact,
        spaceRenting: selectedRow.spaceRenting,
        floorNumber: selectedRow.floorNumber,
        PANNumber: selectedRow.PANNumber,
        citizenshipNumber: selectedRow.citizenshipNumber,
        dateOfEffect: selectedRow.dateOfEffect,
        dateOfExpiry: selectedRow.dateOfExpiry,
        userName: selectedRow.userName
      })
    }
  }

  const handleEditButton = (event) => {
    event.preventDefault()

    const userInput = {
      ...formState,
      leaseId: selectedRow.leaseId
    }

    console.log('User Input:', userInput)
    editLeaseMutation.mutate(userInput)
    document.getElementById('edit-table').close()
  }

  const handleDeleteOpen = () => {
    const dialog = document.getElementById('delete-from-table')
    if (dialog) {
      dialog.showModal()

      if (selectedRow !== null) {
        console.log('Row contents from delete method:', selectedRow)
      } else {
        console.log('Nothing is selected or invalid selectedRow value')
      }
    }
  }

  const openScanner = () => {
    window.electronAPI.openScanner()
  }

  const handleLeaseGeneratorButton = () => {
    const dialog = document.getElementById('lease-generator')
    if (dialog) {
      dialog.showModal()
    }
  }

  const handleLeaseGeneratorConfirm = (rows) => {
    // console.log("before calling of API ");
    if (selectedRow !== null) {
      console.log('Row contents:', selectedRow)
      window.electronAPI.printDocument(selectedRow)
    }
    // console.log("After Calling of API");
  }

  if (leaseQuery.isLoading) {
    return (
      <div className="Dashboard" style={{}}>
        <h1>Lease</h1>
        <span style={{ color: 'gray' }}>Loading...</span>
      </div>
    )
  }

  if (leaseQuery.isError) {
    return (
      <div className="Dashboard" style={{}}>
        <h1>Lease</h1>
        <span style={{ color: 'red' }}>Unexpected Error Occured!</span>
      </div>
    )
  }

  return (
    <div className="lease-container">
      <h1>Lease Details</h1>

      <div className="lease-buttons-container">
        <button
          onClick={() => {
            const dialog = document.getElementById('add-to-table')
            if (dialog) {
              dialog.showModal()
            }
          }}
        >
          Add
        </button>
        <dialog
          id="add-to-table"
          onClick={(event) => {
            const floorModal = document.getElementById('add-to-table')
            if (event.target === floorModal) {
              floorModal.close()
            }
          }}
        >
          <h1>Add new Entry</h1>
          <form onSubmit={handleAddButton}>
            <label htmlFor="add-first-name">First Name:</label>
            <input
              id="add-first-name"
              name="firstName"
              onChange={handleInputChange}
              value={formState.firstName}
              type="text"
            />

            <label htmlFor="add-last-name">Last Name:</label>
            <input
              id="add-last-name"
              name="lastName"
              onChange={handleInputChange}
              value={formState.lastName}
              type="text"
            />

            <label htmlFor="add-contact">Contact:</label>
            <input
              id="add-contact"
              name="contact"
              onChange={handleInputChange}
              value={formState.contact}
              type="number"
            />

            <label htmlFor="add-emergency-contact">Emergency Contact:</label>
            <input
              id="add-emergency-contact"
              name="emergencyContact"
              onChange={handleInputChange}
              value={formState.emergencyContact}
              type="number"
            />

            <label htmlFor="add-space-renting">Space Renting:</label>
            <input
              id="add-space-renting"
              name="spaceRenting"
              onChange={handleInputChange}
              value={formState.spaceRenting}
              type="text"
            />

            <label htmlFor="add-floor-number">Floor Number:</label>
            <input
              id="add-floor-number"
              name="floorNumber"
              onChange={handleInputChange}
              value={formState.floorNumber}
              type="text"
            />

            <label htmlFor="add-pan-number">PAN No:</label>
            <input
              id="add-pan-number"
              name="PANNumber"
              onChange={handleInputChange}
              value={formState.PANNumber}
              type="text"
            />

            <label htmlFor="add-citizenship-number">Citizenship:</label>
            <input
              id="add-citizenship-number"
              name="citizenshipNumber"
              onChange={handleInputChange}
              value={formState.citizenshipNumber}
              type="text"
            />

            <label htmlFor="add-date-of-effect">Date of Effect:</label>
            <input
              id="add-date-of-effect"
              name="dateOfEffect"
              onChange={handleInputChange}
              value={formState.dateOfEffect}
              type="date"
            />

            <label htmlFor="add-date-of-expiry">Date of Expiry:</label>
            <input
              id="add-date-of-expiry"
              name="dateOfExpiry"
              onChange={handleInputChange}
              value={formState.dateOfExpiry}
              type="date"
            />

            <label htmlFor="add-username">username:</label>
            <input
              id="add-usernname"
              name="userName"
              onChange={handleInputChange}
              value={formState.userName}
              type="text"
            />

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button type="submit">Save</button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('add-to-table').close()
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </dialog>

        <button onClick={handleEditOpen}>Edit</button>
        <dialog
          id="edit-table"
          onClick={(event) => {
            const floorModal = document.getElementById('edit-table')
            if (event.target === floorModal) {
              floorModal.close()
            }
          }}
        >
          {selectedRow != null ? (
            <div>
              <h1>Edit Entry</h1>
              <form onSubmit={handleEditButton}>
                <label htmlFor="edit-first-name">First Name:</label>
                <input
                  id="edit-first-name"
                  name="firstName"
                  type="text"
                  value={formState.firstName}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-last-name">Last Name:</label>
                <input
                  id="edit-last-name"
                  name="lastName"
                  type="text"
                  value={formState.lastName}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-contact">Contact:</label>
                <input
                  id="edit-contact"
                  name="contact"
                  type="number"
                  value={formState.contact}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-emergency-contact">Emergency Contact:</label>
                <input
                  id="edit-emergency-contact"
                  name="emergencyContact"
                  type="number"
                  value={formState.emergencyContact}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-space-number">Space Renting:</label>
                <input
                  id="edit-space-number"
                  name="spaceRenting"
                  type="text"
                  value={formState.spaceRenting}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-floor-number">Floor Number:</label>
                <input
                  id="edit-floor-number"
                  name="floorNumber"
                  type="text"
                  value={formState.floorNumber}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-pan-number">PAN No:</label>
                <input
                  id="edit-pan-number"
                  name="PANNumber"
                  type="text"
                  value={formState.PANNumber}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-citizenship-number">Citizenship:</label>
                <input
                  id="edit-citizenship-number"
                  name="citizenshipNumber"
                  value={formState.citizenshipNumber}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-date-of-effect">Date of Effect:</label>
                <input
                  id="edit-date-of-effect"
                  name="dateOfEffect"
                  type="date"
                  value={formState.dateOfEffect}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-date-of-expiry">Date of Expiry:</label>
                <input
                  id="edit-date-of-expiry"
                  name="dateOfExpiry"
                  type="date"
                  value={formState.dateOfExpiry}
                  onChange={handleInputChange}
                />

                <label htmlFor="edit-username">username:</label>
                <input
                  id="edit-usernname"
                  name="userName"
                  value={formState.userName}
                  onChange={handleInputChange}
                  type="text"
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
                      document.getElementById('edit-table').close()
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <h1>Edit Entry:</h1>
              <p>Nothing selected</p>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('edit-table').close()
                }}
              >
                Close
              </button>
            </>
          )}
        </dialog>

        <button onClick={() => handleDeleteOpen()}>Delete</button>
        <dialog
          id="delete-from-table"
          onClick={(event) => {
            const floorModal = document.getElementById('delete-from-table')
            if (event.target === floorModal) {
              floorModal.close()
            }
          }}
        >
          <h2>Confirm Deletion:</h2>
          {selectedRow !== null ? (
            <>
              <p style={{ color: 'red' }}>
                Records of {selectedRow.firstName} {selectedRow.lastName} (ID no:
                {selectedRow.leaseId})?
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    deleteLeaseMutation.mutate(selectedRow.leaseId)
                    document.getElementById('delete-from-table').close()
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('delete-from-table').close()
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
                  document.getElementById('delete-from-table').close()
                }}
              >
                Close
              </button>
            </>
          )}
        </dialog>

        <button
          onClick={() => {
            if (selectedRow && selectedRow.leaseId) {
              navigate(`/Home/docs?leaseId=${selectedRow.leaseId}`)
            }
          }}
        >
          View Docs
        </button>

        <button onClick={() => handleLeaseGeneratorButton()}>Lease Generator</button>
        <dialog
          id="lease-generator"
          onClick={(event) => {
            const leaseModal = document.getElementById('lease-generator')
            if (event.target === leaseModal) {
              leaseModal.close()
            }
          }}
        >
          <h2>Lease Generator:</h2>
          {selectedRow !== null ? (
            <>
              <p style={{ color: 'red' }}>
                Records of {selectedRow.firstName} {selectedRow.lastName} (ID no:
                {selectedRow.leaseId})?
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <button type="button" onClick={() => handleLeaseGeneratorConfirm(rows)}>
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('lease-generator').close()
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
                  document.getElementById('lease-generator').close()
                }}
              >
                Close
              </button>
            </>
          )}
        </dialog>
      </div>

      <div className="table-container">
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row)
              return (
                <tr
                  {...row.getRowProps()}
                  style={
                    selectedRow && selectedRow.leaseId === row.original.leaseId
                      ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                      : {}
                  }
                  onClick={() =>
                    setSelectedRow(
                      selectedRow && selectedRow.leaseId === row.original.leaseId
                        ? null
                        : row.original
                    )
                  }
                >
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}> {cell.render('Cell')} </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Lease
