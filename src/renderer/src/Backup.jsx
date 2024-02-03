import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import './assets/Backup.css'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

function BackupCard({ title, onCardClick, setIsClicked, isClicked }) {
  // State to track whether the card is clicked

  // Function to handle card click
  const handleCardClick = () => {
    setIsClicked(!isClicked)
    onCardClick()
  }

  return (
    <div className="BackupCard" onClick={handleCardClick}>
      <motion.div
        className="BackupCard__header"
        initial={{ opacity: 1 }}
        animate={{ opacity: isClicked ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <motion.div
          style={{
            width: '90%',
            aspectRatio: '1/1',
            borderTop: '3px solid hsl(0, 100%, 100%)',
            borderRight: '1px solid hsl(0, 90%, 100%)',
            borderBottom: '3px solid hsl(0, 100%, 100%)',
            borderRadius: '50%'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
        />
      </motion.div>

      <div
        style={{
          backgroundColor: 'transparent',
          color: 'white'
        }}
        className={`BackupCard__footer ${isClicked ? 'shrunk' : ''}`}
      >
        <div>
          <h1 className="BackupCard__footer--h1">
            {isClicked ? `${title}ing...` : `${title} Backup`}{' '}
          </h1>
        </div>
      </div>
    </div>
  )
}

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
  const [isImportClicked, setIsImportClicked] = useState(false)
  const [isExportClicked, setIsExportClicked] = useState(false)

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
      setIsExportClicked(false) // Set isExportClicked to false when the mutation is successful
      toast.success('Export successful!') // Display a success toast
    },
    onError: (error) => {
      console.error('Error during export:', error)
      setIsExportClicked(false) // Set isExportClicked to false when the mutation fails
      toast.error('Error during export.') // Display an error toast
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
    setIsImportClicked(false)
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
        setIsExportClicked(false)
      }
    } catch (error) {
      console.error('Error while invoking exportBackupFolder:', error)
      setIsExportClicked(false) // Set isExportClicked to false no matter what
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
              setIsImportClicked(false)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsImportClicked(false)
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
        <BackupCard
          title={'Import'}
          onCardClick={handleImportClick}
          setIsClicked={setIsImportClicked}
          isClicked={isImportClicked}
        />
        <BackupCard
          title={'Export'}
          onCardClick={handleExportClick}
          setIsClicked={setIsExportClicked}
          isClicked={isExportClicked}
        />

        {/* <button className="backup__button" onClick={() => handleImportClick()}>
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
        </button> */}
      </div>
    </div>
  )
}

export default Backup
