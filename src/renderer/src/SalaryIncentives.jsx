import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import SalaryIncentivesTable from './SalaryIncentivesTable'

const SalaryIncentives = () => {
  const { token, userId, usernameInSession } = useAuth()
  const queryClient = useQueryClient()

  const getSalaryIncentivesDetailsQuery = useQuery({
    queryKey: ['getSalaryIncentivesDetailsQuery'],
    queryFn: () => window.electronAPI.getSalaryIncentivesDetails(token, usernameInSession, userId),
    refetchOnWindowFocus: true
  })

  const updateUserDetailsMutation = useMutation({
    mutationFn: (userData) =>
      window.electronAPI.updateSalaryIncentivesDetails(token, usernameInSession, userId, userData),
    onSuccess: (something) => {
      console.log('User details updated successfully', something)
      queryClient.invalidateQueries(['getSalaryIncentivesDetailsQuery'])
    }
  })

  //   React.useEffect(() => {
  //     console.log('getSalaryIncentivesDetails', getSalaryIncentivesDetailsQuery.data)
  //   }, [getSalaryIncentivesDetailsQuery.data])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <h1>Salary and Incentives</h1>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {getSalaryIncentivesDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getSalaryIncentivesDetailsQuery.isError ? (
          <div>Error: {getSalaryIncentivesDetailsQuery.error.message}</div>
        ) : (
          <SalaryIncentivesTable
            typeId="userid"
            data={getSalaryIncentivesDetailsQuery.data}
            columns={salaryIncentivesColumns}
            updateFunction={updateUserDetailsMutation.mutate}
          />
        )}
      </div>
    </div>
  )
}

// HOISTING THE COLUMNS AND DATA

const salaryIncentivesColumns = [
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
    Header: 'Base Salary',
    accessor: 'base_salary',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newSalary = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            base_salary: newSalary
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.base_salary)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="number"
          defaultValue={value}
          onChange={handleInputChangeLocal}
        />
      )
    }
  },

  {
    Header: 'Bonus',
    accessor: 'bonus',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newBonus = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            bonus: newBonus
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.bonus)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="number"
          defaultValue={value}
          onChange={handleInputChangeLocal}
        />
      )
    }
  },

  {
    Header: 'Incentives',
    accessor: 'incentives',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newIncentives = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'userid' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            incentives: newIncentives
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.incentives)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="number"
          defaultValue={value}
          onChange={handleInputChangeLocal}
        />
      )
    }
  }
]

export default SalaryIncentives
