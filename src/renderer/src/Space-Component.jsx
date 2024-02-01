import useAuth from './customHooks/useAuth'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import './assets/Space-Component.css'
import { toast } from 'react-toastify'

const SpaceComponent = ({ spaceItem }) => {
  const openModal = () => {
    const Modal = document.getElementById(spaceItem.spaceId)
    Modal.showModal()
  }

  const closeModal = () => {
    let ModalCloser = document.getElementById(spaceItem.spaceId)
    //console.log(ModalCloser);
    ModalCloser.close()
  }

  const handleBackdropClick = (event) => {
    const Modal = document.getElementById(spaceItem.spaceId)
    if (event.target == Modal) {
      Modal.close()
    }
  }

  const handleDelete = (event) => {
    console.log('Delete')
    spaceDeletionMutation.mutate(spaceItem.spaceId)
    closeModal()
  }

  const queryClient = useQueryClient()

  const spaceDeletionMutation = useMutation({
    mutationFn: window.electronAPI.deleteSpace,
    onSuccess: () => {
      queryClient.invalidateQueries(['floorData'])
      toast.success('Space deleted successfully', {
        autoClose: 2000,
        onClick: () => toast.dismiss()
      })
    }
  })

  return (
    <>
      <div className="Space-Component-Container" onClick={openModal}>
        <button className="Open-Space-Button">
          <div className="Space-Image">
            <img
              src={`http://localhost:3000/image/${
                spaceItem.photoPath ? spaceItem.photoPath : 'default.png'
              }`}
              alt="Image of Floor"
            />
          </div>
        </button>
        <div className="Space-Number">Space {spaceItem.spaceNumber}</div>
      </div>

      <dialog
        className="Space-Component-Modal"
        id={spaceItem.spaceId}
        onClick={handleBackdropClick}
      >
        <div className="Space-Component-Modal-Image-Container">
          {' '}
          <img
            src={`http://localhost:3000/image/${
              spaceItem.photoPath ? spaceItem.photoPath : 'default.png'
            }`}
            alt="Image of Floor"
            //target hex 7439db source codepen.io/sosuke/pen/Pjoqqp
            style={{
              filter: spaceItem.photoPath
                ? 'none'
                : ' brightness(0%) invert(45%) sepia(68%) saturate(1961%) hue-rotate(230deg) brightness(91%) contrast(91%)'
            }}
          />{' '}
        </div>
        <div className="Space-Component-Modal-Detail-Container">
          <p>Space No: {spaceItem.spaceNumber}</p>
          <p>Rent: Rs.{spaceItem.rent}/-</p>
          <p>Vacant: {spaceItem.vacancy === 1 ? 'YES' : 'NO'}</p>
          <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
            <button
              className="space-delete-button"
              style={{
                background: '#C21E56',
                color: 'white',
                border: 'none',
                outline: 'none'
              }}
              onClick={handleDelete}
            >
              Delete
            </button>
            <button className="space-cancel-button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default SpaceComponent
