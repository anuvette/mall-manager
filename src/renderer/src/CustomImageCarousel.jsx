import './assets/CustomImageCarousel.css'
import React, { useState } from 'react'
import { HashLink } from 'react-router-hash-link'
import useAuth from './customHooks/useAuth'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const CustomImageCarousel = ({ queryKey, imageDetails }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const { token, usernameInSession } = useAuth()
  const queryClient = useQueryClient()

  const handleActiveSlideIndexChange = (newIndex) => {
    setActiveSlideIndex(newIndex)
  }

  const handleScroll = (event) => {
    const { scrollLeft, clientWidth, scrollWidth } = event.target

    if (scrollWidth > clientWidth) {
      const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100
      const numberOfElements = imageDetails.length
      const newIndex = Math.min(
        Math.floor(scrollPercentage / (100 / numberOfElements)),
        numberOfElements - 1
      )
      setActiveSlideIndex(newIndex)
    }
  }

  const addImageMutation = useMutation({
    mutationFn: ({ token, usernameInSession, imageData }) => {
      // console.log('Parameters in mutationFn:', token, usernameInSession, imageData)
      return window.electronAPI.addTaxManagerImageDetails(token, usernameInSession, imageData)
    },
    onSuccess: () => {
      //console.log("Lease added successfully");
      queryClient.invalidateQueries([`${queryKey}`])
    }
  })

  const editImageMutation = useMutation({
    mutationFn: ({ token, usernameInSession, imageData }) =>
      window.electronAPI.updateTaxManagerImageDetails(token, usernameInSession, imageData),
    onSuccess: () => {
      //console.log("Lease added successfully");
      queryClient.invalidateQueries([`${queryKey}`])
    }
  })

  const deleteImageMutation = useMutation({
    mutationFn: ({ token, usernameInSession, spaceImageId }) =>
      window.electronAPI.deleteTaxManagerImageDetails(token, usernameInSession, spaceImageId),
    onSuccess: () => {
      console.log('Image Deleted successfully')
      queryClient.invalidateQueries([`${queryKey}`])
    }
  })

  const handleImageUpload = ({ action, spaceImageId }) => {
    // console.log('usernameInSession from handle frontend', token, usernameInSession)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (event) => {
      const file = event.target.files[0]
      const imagePath = file.path
      // console.log('imagePath', imagePath)

      if (action === 'add') {
        addImageMutation.mutate({
          token: token,
          usernameInSession: usernameInSession,
          imageData: {
            imagePath: imagePath
          }
        })
      }

      if (action === 'edit') {
        editImageMutation.mutate({
          token: token,
          usernameInSession: usernameInSession,
          imageData: {
            imagePath: imagePath,
            spaceImageId: spaceImageId
          }
        })
      }
    }
    input.click()
  }

  console.log('imageDetails', imageDetails)
  // console.log('queryKey', queryKey)

  return (
    <div className="CustomImageCarousel">
      <div className="CustomImageCarousel-Container" onScroll={handleScroll}>
        {!Array.isArray(imageDetails) || imageDetails.length !== 0 ? (
          (Array.isArray(imageDetails) ? imageDetails : [imageDetails]).map((imageDetail, i) => (
            <div className="CustomImageSlide" id={`imageDetail-${i}`} key={i}>
              <img
                src={`http://localhost:3000/image/${imageDetail?.imagePath || 'default.jpg'}`}
                alt={`Space Photo ${i}`}
              ></img>
              <div className="CustomButtonContainer">
                <button
                  style={{ fontSize: '4rem', color: 'white' }}
                  onClick={() => {
                    handleImageUpload({ action: 'add', spaceImageId: 0 })
                  }}
                >
                  &#43; {/* This is the "add" button */}
                </button>
                <button
                  style={{ fontSize: '3rem', color: 'white' }}
                  onClick={() =>
                    handleImageUpload({
                      action: 'edit',
                      spaceImageId: imageDetail.spaceImageId
                    })
                  }
                >
                  &#x270E; {/* This is the "edit" button */}
                </button>
                <button
                  style={{ fontSize: '3rem', color: 'red' }}
                  onClick={() => {
                    console.log('128 imageDetail iterator', imageDetail)
                    deleteImageMutation.mutate({
                      token: token,
                      usernameInSession: usernameInSession,
                      spaceImageId: imageDetail.spaceImageId
                    })
                  }}
                >
                  &#x1F5D1; {/* This is the "delete" button */}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="CustomImageSlide" id="slide-1">
            <img src="http://localhost:3000/image/default.png" alt="Building Photo 1"></img>
            <div className="CustomButtonContainer">
              <button
                style={{ fontSize: '4rem', color: 'white' }}
                onClick={() => handleImageUpload({ action: 'add' })}
              >
                &#43; {/* This is the "add" button */}
              </button>
            </div>
          </div>
        )}
      </div>
      {imageDetails.length > 1 && (
        <div className="CustomCarouselNav">
          {imageDetails.map((imageDetail, i) => (
            <HashLink
              smooth
              to={`#imageDetail-${i}`}
              key={i}
              style={
                activeSlideIndex === i
                  ? {
                      transition: 'background-color 500ms ease',
                      opacity: 1,
                      backgroundColor: '#7439db'
                    }
                  : {}
              }
              onClick={(event) => {
                //DONT PUT PREVENT DEFAULT HERE IT WILL BREAK THE  ONCLICK NAVIGATION SCROLLING
                handleActiveSlideIndexChange(i)
              }}
            ></HashLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomImageCarousel
