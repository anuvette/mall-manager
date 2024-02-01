import React, { useRef, useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import useAuth from './customHooks/useAuth'
import { toast } from 'react-toastify'
import './assets/FloorModal.css'

const AddNewFloorButton = ({ activeFloor }) => {
  const { usernameInSession, userId, roleInSession, token } = useAuth()
  const [image, setImage] = useState(null)
  const [error, setError] = useState(null) // State for error message
  const imageRef = useRef(null)
  const spaceNumberRef = useRef(null)
  const rentRef = useRef(null)
  const vacancyYesRef = useRef(null)
  const vacancyNoRef = useRef(null)

  const handleSubmit = (event) => {
    event.preventDefault()

    const spaceNumber = Number(spaceNumberRef.current.value)
    const rent = Number(rentRef.current.value)
    const vacancy = vacancyYesRef.current.checked ? '1' : vacancyNoRef.current.checked ? '0' : ''

    const newFloorPayload = {
      floorNumber: activeFloor,
      photoPath: imageRef.current, // Use the image path if available, otherwise use null
      rent: rent,
      //spaceId: Math.floor(Math.random() * 100),  //id is determined at server
      spaceNumber: spaceNumber,
      userid: userId,
      vacancy: vacancy
    }

    //console.log("New Floor Payload:", newFloorPayload);
    floorMutation.mutate(newFloorPayload)

    // Resetting form fields
    event.target.reset()
    setImage(null)
    imageRef.current = null
    document.getElementById('floorModal').close()
  }

  const queryClient = useQueryClient()

  const floorMutation = useMutation({
    mutationFn: window.electronAPI.addNewSpace,
    onSuccess: () => {
      toast.success('New space added successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
      queryClient.invalidateQueries(['floorData'])
    }
  })

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const photo = event.dataTransfer.files[0] // Assuming only one file is being dropped

    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png']

    if (photo && !acceptedTypes.includes(photo.type)) {
      setError('Error: Only image files (jpeg, jpg, png) are allowed.')
      setImage(null)
    } else {
      setError(null)
      const reader = new FileReader()
      reader.onload = () => {
        const base64String = reader.result // Base64 representation of the file
        setImage(base64String)
      }
      reader.readAsDataURL(photo)
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png']

    if (file && !acceptedTypes.includes(file.type)) {
      setError('Error: Only image files (jpeg, jpg, png) are allowed.')
      setImage(null)
    } else {
      setError(null)
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result)
        const imagePath = file.path // Record the absolute file path
        console.log('Uploaded Image Absolute File Path:', imagePath)
        imageRef.current = imagePath // Set the imageRef to the absolute file path
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageRemove = () => {
    setImage(null)
  }

  const openModal = () => {
    const floorModal = document.getElementById('floorModal')
    floorModal.showModal()
  }

  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      closeModal() // Call the closeModal function
      setImage(null)
    }
  }

  const closeModal = () => {
    const floorModal = document.getElementById('floorModal')
    setError(null)
    setImage(null)
    floorModal.close()
  }

  const handleBackdropClick = (event) => {
    const floorModal = document.getElementById('floorModal')
    if (event.target === floorModal) {
      setError(null)
      floorModal.close()
    }
  }

  return (
    <>
      <div className="Add-Button-Container">
        {floorMutation.error && (
          <div className="error-message" style={{ color: 'red' }}>
            Space Already Exists!!
          </div>
        )}
        <button className="Add-Button" onClick={openModal}>
          <div className="Circle">
            <p className="PlusSymbol">&#43;</p>
          </div>
        </button>
        <div className="Add-Button-Text">Add...</div>
        <div className="floorModal-container">
          <dialog id="floorModal" onClick={handleBackdropClick}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                handleSubmit(event)
              }}
            >
              <div className="card">
                <div className="image-upload">
                  {image ? (
                    <div className="image-container">
                      <img src={image} alt="Uploaded" />
                      <button onClick={handleImageRemove} className="cancel-button">
                        X
                      </button>
                    </div>
                  ) : (
                    <label
                      className="upload-area"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={handleDrop}
                    >
                      <input
                        id="add-photo-input"
                        type="file"
                        accept=".jpeg, .jpg, .png"
                        onChange={handleImageUpload}
                      />
                      <h1>Add Photo</h1>
                      <span>Click to upload image</span>
                    </label>
                  )}
                  {error && (
                    <div className="error-message" style={{ color: 'red' }}>
                      {error}
                    </div>
                  )}
                </div>
                <div className="info">
                  <label htmlFor="space-number">Space Num:</label>
                  <input
                    ref={spaceNumberRef}
                    id="space-number"
                    name="spaceNumber"
                    type="number"
                    required
                  />
                  <label htmlFor="rent">Rent:</label>
                  <input
                    ref={rentRef}
                    id="rent"
                    name="rent"
                    type="number"
                    min="10000"
                    max="900000"
                    defaultValue={30000}
                    required
                  />
                  <div className="vacancy-status">
                    <p>Vacancy:</p>
                    <div className="vacancy-mother-container">
                      <div className="vacancy-input-container">
                        <input
                          ref={vacancyYesRef}
                          id="vacancy-yes"
                          type="radio"
                          name="Vacancy"
                          required
                        />{' '}
                        <label htmlFor="vacancy-yes">Yes</label>
                      </div>
                    </div>
                    <div className="vacancy-mother-container">
                      <div className="vacancy-input-container">
                        <input
                          ref={vacancyNoRef}
                          id="vacancy-no"
                          type="radio"
                          name="Vacancy"
                          defaultChecked
                          required
                        />{' '}
                        <label htmlFor="vacancy-no">No</label>
                      </div>
                    </div>
                  </div>
                  <div className="button-container">
                    <div className="error-message" style={{ color: 'red' }}></div>
                    <button id="submit-button" type="submit">
                      Submit
                    </button>
                    <button
                      id="cancel-button"
                      onClick={closeModal}
                      onKeyDown={handleEscapeKey}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </dialog>
        </div>
      </div>
    </>
  )
}

export default AddNewFloorButton
