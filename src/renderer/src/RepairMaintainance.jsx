import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import RepairMaintainanceTable from './RepairMaintainanceTable'

const RepairMaintainance = () => {
  const { token, usernameInSession } = useAuth()
  const queryClient = useQueryClient()

  const getAllFacilityDetailsQuery = useQuery({
    queryKey: ['getAllFacilityDetailsQuery'],
    queryFn: () => window.electronAPI.getAllFacilityDetails(token, usernameInSession),
    refetchOnWindowFocus: true
  })

  const addFacilityDetailsMutation = useMutation({
    mutationFn: (facilityData) =>
      window.electronAPI.addFacilityDetails(token, usernameInSession, facilityData),
    onSuccess: () => {
      console.log('User details added successfully')
      queryClient.invalidateQueries(['getAllFacilityDetailsQuery'])
    }
  })

  const updateFacilityDetailsMutation = useMutation({
    mutationFn: (facilityData) =>
      window.electronAPI.updateFacilityDetails(token, usernameInSession, facilityData),
    onSuccess: (something) => {
      console.log('User details updated successfully', something)
      queryClient.invalidateQueries(['getAllFacilityDetailsQuery'])
    }
  })

  const deleteFacilityDetailsMutation = useMutation({
    mutationFn: (facilityIds) =>
      window.electronAPI.deleteFacilityDetails(token, usernameInSession, facilityIds),
    onSuccess: () => {
      console.log('User details deleted successfully')
      queryClient.invalidateQueries(['getAllFacilityDetailsQuery'])
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
      <h1>Repair and Maintainance</h1>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {getAllFacilityDetailsQuery.isLoading ? (
          <div>Loading...</div>
        ) : getAllFacilityDetailsQuery.isError ? (
          <div>Error: {getAllFacilityDetailsQuery.error.message}</div>
        ) : (
          <RepairMaintainanceTable
            typeId="facilityId"
            data={getAllFacilityDetailsQuery.data}
            columns={facilityColumns}
            insertFunction={addFacilityDetailsMutation.mutate}
            updateFunction={updateFacilityDetailsMutation.mutate}
            deleteFunction={deleteFacilityDetailsMutation.mutate}
          />
        )}
      </div>
    </div>
  )
}

// HOISTING THE COLUMNS AND DATA

const facilityColumns = [
  {
    Header: 'ID',
    accessor: 'facilityId'
  },
  {
    Header: 'SN',
    accessor: 'sn',
    Cell: ({ row }) => {
      return <div>{row.index + 1}</div>
    }
  },
  {
    Header: 'Facility Type',
    accessor: 'facilityType',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newFacilityType = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'facilityId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            facilityType: newFacilityType
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.facilityType)
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
    Header: 'AMC Provider',
    accessor: 'providerName',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newProviderName = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'facilityId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            providerName: newProviderName
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.providerName)
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
    Header: 'Contract Start',
    accessor: 'contractStart',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newContractStart = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'facilityId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            contractStart: newContractStart
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.contractStart)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="date"
          defaultValue={value}
          onChange={handleInputChangeLocal}
        />
      )
    }
  },
  {
    Header: 'Contract End',
    accessor: 'contractEnd',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newContractEnd = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'facilityId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            contractEnd: newContractEnd
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.contractEnd)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="date"
          defaultValue={value}
          onChange={handleInputChangeLocal}
        />
      )
    }
  },
  {
    Header: 'Contract Cost',
    accessor: 'contractCost',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newContractCost = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'facilityId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            contractCost: newContractCost
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.contractCost)
        }
      }, [original])

      return (
        <input
          ref={inputValueRef}
          type="number"
          defaultValue={value}
          onChange={handleInputChangeLocal}
          required
        />
      )
    }
  },
  {
    Header: 'Services',
    accessor: 'services',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newServices = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'facilityId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            services: newServices
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.services)
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
    Header: 'Frequency',
    accessor: 'frequency',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newFrequency = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'facilityId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            frequency: newFrequency
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.frequency)
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
    Header: 'Contact',
    accessor: 'contactInformation',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newContactInformation = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'facilityId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            contactInformation: newContactInformation
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.contactInformation)
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
    Header: 'Est. Charge',
    accessor: 'estimatedCharge',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newEstimatedCharge = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'facilityId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            estimatedCharge: newEstimatedCharge
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.estimatedCharge)
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
    Header: 'Status',
    accessor: 'status',
    Cell: ({ cell: { value }, row: { original }, onInputChange, onEscapeKeyDown }) => {
      const inputValueRef = React.useRef(value)

      const handleInputChangeLocal = (e) => {
        const newStatus = e.target.value
        const nullifiedOriginal = Object.fromEntries(
          Object.keys(original).map((key) =>
            key === 'facilityId' ? [key, original[key]] : [key, null]
          )
        )
        onInputChange(
          {
            ...nullifiedOriginal,
            status: newStatus
          },
          original
        )
      }

      React.useLayoutEffect(() => {
        if (inputValueRef.current) {
          // console.log('uhh from use effect', inputValueRef.current.value)
          // Pass the ref back to the parent via the callback
          onEscapeKeyDown(inputValueRef, original.status)
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
  }
]

export default RepairMaintainance
