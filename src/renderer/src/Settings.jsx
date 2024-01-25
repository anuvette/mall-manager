import React, { useRef } from 'react'
import './assets/Settings.css'
import useAuth from './customHooks/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const Settings = () => {
  const { token, userId, usernameInSession } = useAuth()
  const queryClient = useQueryClient()
  const [isUpdateSuccessful, setIsUpdateSuccessful] = React.useState(false)

  const usernameRef = useRef()
  const passwordRef = useRef()

  const getUserDetailQuery = useQuery({
    queryKey: ['getUserDetailQuery'],
    queryFn: () => window.electronAPI.getUserDetail(token, usernameInSession, userId),
    refetchOnWindowFocus: true
  })

  const updateUserDetailMutation = useMutation({
    mutationFn: (userData) =>
      window.electronAPI.updateUserDetail(token, usernameInSession, userId, userData),
    onSuccess: () => {
      setIsUpdateSuccessful(true)

      queryClient.invalidateQueries(['getUserDetailQuery'])
    }
  })

  const handleSaveClick = (e) => {
    e.preventDefault()
    const userData = {
      username: usernameRef.current.value,
      password: passwordRef.current.value
    }
    console.log(userData)

    updateUserDetailMutation.mutate(userData)
    usernameRef.current.value = ''
    passwordRef.current.value = ''
  }

  if (getUserDetailQuery.isLoading) {
    return <div>Loading...</div>
  }

  if (getUserDetailQuery.isError) {
    return <div>Error occurred while fetching user details</div>
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        width: '100%',
        overflow: 'scroll',
        padding: '10px'
      }}
    >
      <div className="settings-header">
        <h1 style={{}}>Settings</h1>
      </div>

      <div className="settings-container">
        <div
          style={{
            border: '1px solid white',
            borderRadius: '20px',
            width: 'min(100%,500px)',
            padding: '20px'
          }}
        >
          <div className="settings-info">
            <h2>Username: {getUserDetailQuery.data.username}</h2>
            <h3>Contact: {getUserDetailQuery.data.contact}</h3>
            {isUpdateSuccessful && <h6 style={{ color: 'seagreen' }}>Updated Successfully!</h6>}
          </div>

          <form>
            <div className="settings-body">
              <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '' }}>
                <label>Name:</label>
                <input
                  placeholder={
                    getUserDetailQuery.data.firstName +
                    ' ' +
                    getUserDetailQuery.data.lastName +
                    '(Cannot Change)'
                  }
                  disabled
                ></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Username:</label>
                <input ref={usernameRef} placeholder="Change Username..."></input>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Password:</label>
                <input ref={passwordRef} placeholder="Change Password..."></input>
              </div>
              <div className="settings-button-container">
                <button onClick={handleSaveClick}>Save</button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    usernameRef.current.value = ''
                    passwordRef.current.value = ''
                  }}
                >
                  Discard
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings
