import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import EmployeeTable from './EmployeeTable'

const EmployeeCreation = () => {
  const { token, userId, usernameInSession, roleInSession } = useAuth()
  const queryClient = useQueryClient()

  const getUserDetailsQuery = useQuery({
    queryKey: ['getUserDetailsQuery'],
    queryFn: () => window.electronAPI.getUserDetails(token, usernameInSession, userId),
    refetchOnWindowFocus: true
  })

  const addUserDetailsMutation = useMutation({
    mutationFn: (userData) =>
      window.electronAPI.addUserDetails(token, usernameInSession, userId, userData),
    onSuccess: () => {
      console.log('User details added successfully')
      queryClient.invalidateQueries(['getUserDetailsQuery'])
    }
  })

  const updateUserDetailsMutation = useMutation({
    mutationFn: (userData) =>
      window.electronAPI.updateUserDetails(token, usernameInSession, userId, userData),
    onSuccess: (something) => {
      console.log('User details updated successfully', something)
      queryClient.invalidateQueries(['getUserDetailsQuery'])
    }
  })

  const deleteUserDetailsMutation = useMutation({
    mutationFn: (userIds) =>
      window.electronAPI.deleteUserDetails(token, usernameInSession, userId, userIds),
    onSuccess: () => {
      console.log('User details deleted successfully')
      queryClient.invalidateQueries(['getUserDetailsQuery'])
    }
  })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <h1>Employees And Users</h1>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {getUserDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getUserDetailsQuery.isError ? (
          <div>Error: {getUserDetailsQuery.error.message}</div>
        ) : (
          <EmployeeTable
            typeId="userid"
            data={getUserDetailsQuery.data}
            columns={employeeColumns}
            insertFunction={addUserDetailsMutation.mutate}
            updateFunction={updateUserDetailsMutation.mutate}
            deleteFunction={deleteUserDetailsMutation.mutate}
          />
        )}
      </div>
    </div>
  )
}

// HOISTING THE COLUMNS AND DATA

const employeeColumns = [
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
    accessor: 'firstName',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newFirstName = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            firstName: newFirstName
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.firstName)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="text"
          defaultValue={value}
          onChange={handleInputChangeLocal}
        />
      )
    }
  },
  {
    Header: 'Last Name',
    accessor: 'lastName',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newLastName = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            lastName: newLastName
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.lastName)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="text"
          defaultValue={value}
          onChange={handleInputChangeLocal}
        />
      )
    }
  },
  {
    Header: 'Username',
    accessor: 'username',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newUserName = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            username: newUserName
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.username)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="text"
          defaultValue={value}
          onChange={handleInputChangeLocal}
          required
        />
      )
    }
  },
  {
    Header: 'Password',
    accessor: 'password',
    Cell: ({
      cell: { value },
      row: { original },
      column: { id },
      onInputChange,
      onEscapeKeyDown
    }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newPassword = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            password: newPassword
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.password)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="text"
          defaultValue={value}
          onChange={handleInputChangeLocal}
          disabled
          style={{ cursor: 'not-allowed' }}
        />
      )
    }
  },
  {
    Header: 'Contact',
    accessor: 'contact',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newContact = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            contact: newContact
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.contact)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="text"
          defaultValue={value}
          onChange={handleInputChangeLocal}
        />
      )
    }
  },

  {
    Header: 'Contact 2',
    accessor: 'secondaryContact',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newSecondaryContact = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            secondaryContact: newSecondaryContact
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.secondaryContact)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="text"
          defaultValue={value}
          onChange={handleInputChangeLocal}
        />
      )
    }
  },
  {
    Header: 'isAdmin',
    accessor: 'isAdmin',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const [isChecked, setIsChecked] = React.useState(value === 1)

      const handleCheckboxChange = () => {
        const newIsAdmin = isChecked ? 0 : 1
        setIsChecked(!isChecked)
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            isAdmin: newIsAdmin
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (isChecked !== null) {
          // console.log('uhh from use effect', isChecked)
          // Pass the state back to the parent via the callback
          onEscapeKeyDown(setIsChecked, original.isAdmin)
        }
      }, [original])

      return (
        <label>
          <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
          <p
            style={{
              color: isChecked ? '#14b8a6' : 'hsl(0, 100%, 50%)'
            }}
          >
            {isChecked ? 'Yes' : 'No'}
          </p>
        </label>
      )
    }
  },
  {
    Header: 'isSuperUser',
    accessor: 'isSuperUser',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const [isChecked, setIsChecked] = React.useState(value === 1)

      const handleCheckboxChange = () => {
        const newIsSuperUser = isChecked ? 0 : 1
        setIsChecked(!isChecked)
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            isSuperUser: newIsSuperUser
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (isChecked !== null) {
          // console.log('uhh from use effect', isChecked)
          // Pass the state back to the parent via the callback
          onEscapeKeyDown(setIsChecked, original.isSuperUser)
        }
      }, [original])

      return (
        <label>
          <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
          <p
            style={{
              color: isChecked ? '#14b8a6' : 'hsl(0, 100%, 50%)'
            }}
          >
            {isChecked ? 'Yes' : 'No'}
          </p>
        </label>
      )
    }
  }
]

export default EmployeeCreation
