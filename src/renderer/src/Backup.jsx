import React from 'react'
import { useMutation } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import './assets/Backup.css'

const Backup = () => {
  const {
    token,
    setToken,
    usernameInSession,
    setUsernameInSession,
    userId,
    setUserId,
    roleInSession,
    setRoleInSession
  } = useAuth()
  const [successMessage, setSuccessMessage] = React.useState(null)
  const dialogRef = React.useRef(null)

  const exportMutation = useMutation({
    mutationFn: async (backupFolderPath) => {
      const result = await window.electronAPI.exportBackup(
        token,
        usernameInSession,
        backupFolderPath
      )
      return result
    },
    onSuccess: (result) => {
      console.log('Export mutation is loading:', exportMutation.isPending)
      setSuccessMessage('Export successful')
    }
  })

  const handleImportClick = () => {
    dialogRef.current.showModal()
  }

  const handleConfirmClick = () => {
    try {
      const invalidatedToken = window.electronAPI.logout(token, usernameInSession)
      setToken(invalidatedToken)
      setUsernameInSession(null)
      setRoleInSession(null)
      setUserId(null)
      dialogRef.current.close()
      window.electronAPI.importBackup()
    } catch (error) {
      setIsError(true)
      setErrorMessage(error)
    }
  }

  const handleCancelClick = () => {
    dialogRef.current.close()
  }

  const handleBackdropClick = () => {
    dialogRef.current.close()
  }

  const handleDialogClick = (event) => {
    event.stopPropagation()
  }

  const handleExportClick = async () => {
    try {
      const response = await window.electronAPI.exportBackupFolder({
        title: 'Select Export Folder',
        properties: ['openDirectory']
      })

      if (response.success) {
        console.log('Selected folder path:', response.folderPath)
        // Perform the export with the selected folder path
        exportMutation.mutate(response.folderPath)
      } else {
        console.error('Error during export:', response.error)
      }
    } catch (error) {
      console.error('Error while invoking exportBackupFolder:', error)
    }
  }

  return (
    <div className="backup">
      <div className="backup__modal--container">
        <dialog
          ref={dialogRef}
          className="backup__modal"
          onClick={(event) => {
            if (event.target === dialogRef.current) {
              dialogRef.current.close()
            }
          }}
        >
          <p>Are you sure you want to overwrite your current save?</p>
          <div>
            <button onClick={handleConfirmClick}>Confirm</button>
            <button style={{}} onClick={handleCancelClick}>
              Cancel
            </button>
          </div>
        </dialog>
      </div>
      <div className="backup__title">
        <h1>Backup Manager</h1>
        <p>Here you can backup your Database and Image Files.</p>
      </div>
      <div className="backup__actions">
        <button className="backup__button" onClick={() => handleImportClick()}>
          Import Backup
        </button>
        <button
          className="backup__button"
          onClick={() => handleExportClick()}
          disabled={exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <>
              <div className="spinner"></div> Exporting...
            </>
          ) : (
            'Export Backup'
          )}
        </button>
      </div>
      <div className="backup">
        {successMessage && (
          <h1 className="backup__success" style={{ color: 'white' }}>
            {successMessage}!!!
          </h1>
        )}
      </div>
    </div>
  )
}

export default Backup
