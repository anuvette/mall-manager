import './assets/Building.css'
import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const EditingModeInputFields = ({ currentValue, getChildState }) => {
  const [values, setValues] = useState({ ...currentValue })

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  useEffect(() => {
    getChildState(values)
  }, [values, getChildState])

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="EditingModeInputFields">
          <li>
            <label>
              <b>Total number of Blocks: </b>
              <input
                type="text"
                name="totalBlocks"
                id="totalBlocks"
                value={values.totalBlocks}
                onChange={handleChange}
              />
            </label>
          </li>
          <li>
            <label>
              <b>Parking Space: </b>
              <input
                type="text"
                name="parkingSpace"
                id="parkingSpace"
                value={values.parkingSpace}
                onChange={handleChange}
              />{' '}
            </label>
          </li>
          <li>
            <label>
              <b>Distance from road: </b>
              <input
                type="text"
                name="distanceFromRoad"
                id="distanceFromRoad"
                value={values.distanceFromRoad}
                onChange={handleChange}
              />
            </label>
          </li>
          <li>
            <label>
              <b>Servant/Guard Room: </b>
              <input
                type="text"
                name="servantRoom"
                id="servantRoom"
                value={values.servantRoom}
                onChange={handleChange}
              />
            </label>
          </li>
          <li>
            <label>
              <b>Generator/Solar Power: </b>
              <input
                type="text"
                name="generator"
                id="generator"
                value={values.generator}
                onChange={handleChange}
              />
            </label>
          </li>
          <li>
            <label>
              <b>Water: </b>
              <input
                type="text"
                name="waterDetails"
                id="waterDetails"
                value={values.waterDetails}
                onChange={handleChange}
              />{' '}
            </label>
          </li>
          <li>
            <label>
              <b>Gate, Compound details: </b>
              <input
                type="text"
                name="gateDetails"
                id="gateDetails"
                value={values.gateDetails}
                onChange={handleChange}
              />
            </label>
          </li>
          <li>
            <label>
              <b>Price: </b>
              <input
                type="text"
                name="price"
                id="price"
                value={values.price}
                onChange={handleChange}
              />
            </label>
          </li>
          <li>
            <b>Building owner details:</b>
            <ul style={{}}>
              <li>
                <label>
                  Name:{' '}
                  <input
                    type="text"
                    name="ownerName"
                    id="ownerName"
                    value={values.ownerName}
                    onChange={handleChange}
                  />
                </label>
              </li>
              <li>
                <label>
                  <b>Company: </b>
                  <input
                    type="text"
                    name="ownerCompany"
                    id="ownerCompany"
                    value={values.ownerCompany}
                    onChange={handleChange}
                  />
                </label>
              </li>
              <li>
                <label>
                  <b>Address: </b>
                  <input
                    type="text"
                    name="ownerAddress"
                    id="ownerAddress"
                    value={values.ownerAddress}
                    onChange={handleChange}
                  />
                </label>
              </li>
              <li>
                <label>
                  <b>Contact number (Primary): </b>
                  <input
                    type="text"
                    name="ownerPrimaryContact"
                    id="ownerPrimaryContact"
                    value={values.ownerPrimaryContact}
                    onChange={handleChange}
                  />
                </label>
              </li>
              <li>
                <label>
                  <b>Contact number (Secondary): </b>
                  <input
                    type="text"
                    name="ownerSecondaryContact"
                    id="ownerSecondaryContact"
                    value={values.ownerSecondaryContact}
                    onChange={handleChange}
                  />
                </label>
              </li>
            </ul>
          </li>
        </div>
      </form>
    </>
  )
}

const Building = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [buildingData, setBuildingData] = useState({})
  const queryClient = useQueryClient()

  const getBuildingImageDetailsQuery = useQuery({
    queryKey: ['buildingImageData'],
    queryFn: () => window.electronAPI.getBuildingImageDetails()
    // refetchOnWindowFocus: false,
  })

  const addImageMutation = useMutation({
    mutationFn: (buildingImageData) =>
      window.electronAPI.addBuildingImageDetails(buildingImageData),
    onSuccess: () => {
      //console.log("Lease added successfully");
      queryClient.invalidateQueries(['buildingImageData'])
    }
  })

  const editImageMutation = useMutation({
    mutationFn: (buildingImageData) =>
      window.electronAPI.updateBuildingImageDetails(buildingImageData),
    onSuccess: () => {
      //console.log("Lease added successfully");
      queryClient.invalidateQueries(['buildingImageData'])
    }
  })

  const deleteImageMutation = useMutation({
    mutationFn: (buildingImageData) =>
      window.electronAPI.deleteBuildingImageDetails(buildingImageData),
    onSuccess: () => {
      //console.log("Lease added successfully");
      queryClient.invalidateQueries(['buildingImageData'])
    }
  })

  const getBuildingDetailsQuery = useQuery({
    queryKey: ['buildingData'],
    queryFn: () => window.electronAPI.getBuildingDetails()
    // refetchOnWindowFocus: false,
  })

  const editBuildingDetailsMutation = useMutation({
    mutationFn: (buildingData) => window.electronAPI.updateBuildingDetails(buildingData),
    onSuccess: () => {
      // console.log('Lease added successfully')
      queryClient.invalidateQueries(['buildingData'])
    }
  })

  const deleteBuildingDetailsMutation = useMutation({
    mutationFn: () => window.electronAPI.deleteAllBuildingDetails(),
    onSuccess: () => {
      //console.log('Lease added successfully')
      queryClient.invalidateQueries(['buildingData'])
    }
  })

  const memoizedBuildingImageData = useMemo(
    () => getBuildingImageDetailsQuery.data,
    [getBuildingImageDetailsQuery.data]
  )
  const memoizedBuildingData = useMemo(
    () => getBuildingDetailsQuery.data,
    [getBuildingDetailsQuery.data]
  )

  const handleActiveSlideIndexChange = (newIndex) => {
    console.log('newIndex from handling', newIndex)
    setActiveSlideIndex(newIndex)
  }

  const handleImageUpload = ({ action, buildingImageId, imageIndex }) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (event) => {
      const file = event.target.files[0]
      const imagePath = file.path
      console.log('imagePath', imagePath)
      // Replace axios with mutation function here
      if (action === 'add') {
        addImageMutation.mutate({
          buildingImageId: buildingImageId,
          imageIndex: imageIndex,
          imagePath: imagePath
        })
      }

      if (action === 'edit') {
        editImageMutation.mutate({
          buildingImageId: buildingImageId,
          imageIndex: imageIndex,
          imagePath: imagePath
        })
      }
    }

    input.click()
  }

  const handleScroll = (event) => {
    const { scrollLeft, clientWidth, scrollWidth } = event.target

    if (scrollWidth > clientWidth) {
      const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100
      const numberOfElements = memoizedBuildingImageData.imageCount
      const newIndex = Math.min(
        Math.floor(scrollPercentage / (100 / numberOfElements)),
        numberOfElements - 1
      )
      console.log(newIndex)
      setActiveSlideIndex(newIndex)
    }
  }

  const getChildState = (childState) => {
    console.log('Child State:', childState)
    setBuildingData(childState)
  }

  if (getBuildingDetailsQuery.isLoading || getBuildingImageDetailsQuery.isLoading)
    return <div>Loading...</div>
  if (getBuildingDetailsQuery.isError || getBuildingImageDetailsQuery.isError)
    return <div>Error</div>

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '10px'
        }}
      >
        <h1>Building</h1>

        <div className="building-container">
          <div className="Building-Photo">
            <div className="Building-Carousel" onScroll={handleScroll}>
              {memoizedBuildingImageData.imageCount > 0 ? (
                memoizedBuildingImageData.imageDetails.map((imageDetail, i) => (
                  <div id={`slide-${i + 1}`} key={i}>
                    <img
                      src={`http://localhost:3000/image/${imageDetail.imagePath}`}
                      alt={`Building Photo ${i + 1}`}
                    ></img>
                    <div className="Building-Button-Container">
                      <button
                        style={{ fontSize: '4rem', color: 'white' }}
                        onClick={() => {
                          handleImageUpload({
                            action: 'add',
                            buildingImageId: imageDetail.buildingImageId,
                            imageIndex: memoizedBuildingImageData.imageCount
                          })
                        }}
                      >
                        &#43; {/* This is the "add" button */}
                      </button>
                      <button
                        style={{ fontSize: '3rem', color: 'white' }}
                        onClick={() =>
                          handleImageUpload({
                            action: 'edit',
                            buildingImageId: imageDetail.buildingImageId,
                            imageIndex: imageDetail.imageIndex
                          })
                        }
                      >
                        &#x270E;
                      </button>
                      {/* This is the "edit" button */}
                      <button
                        style={{ fontSize: '3rem', color: 'red' }}
                        onClick={() =>
                          deleteImageMutation.mutate({
                            buildingImageId: imageDetail.buildingImageId,
                            imageIndex: imageDetail.imageIndex
                          })
                        }
                      >
                        &#x1F5D1; {/* This is the "delete" button */}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div id="slide-1">
                  <img src="http://localhost:3000/image/default.png" alt="Building Photo 1"></img>
                  <div className="Building-Button-Container">
                    <button
                      style={{ fontSize: '4rem', color: 'white' }}
                      onClick={() =>
                        handleImageUpload({ action: 'add', buildingImageId: 0, imageIndex: 0 })
                      }
                    >
                      &#43; {/* This is the "add" button */}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="Building-Carousel-Nav">
              {memoizedBuildingImageData.imageDetails.map((imageDetail, i) => (
                <a
                  href={`#slide-${i + 1}`}
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
                    handleActiveSlideIndexChange(i)
                  }}
                ></a>
              ))}
            </div>
          </div>

          <div className="Building-Details">
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                // border: '2px solid red',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h1>Report</h1>
              <div>
                <button
                  style={{
                    background: 'transparent',
                    alignSelf: 'end',
                    fontSize: '3rem',
                    color: 'white',
                    padding: '0'
                  }}
                  onClick={() => {
                    if (isEditing) {
                      editBuildingDetailsMutation.mutate(buildingData)
                      setIsEditing(false)
                    } else {
                      setIsEditing(true)
                    }
                  }}
                >
                  {isEditing ? '✔' : '✎'}
                  {/* this is edit button */}
                </button>
                <button
                  style={{
                    background: 'transparent',
                    alignSelf: 'end',
                    fontSize: isEditing ? '3rem' : '3rem',
                    color: 'red',
                    padding: '0 10px'
                  }}
                  onClick={() => {
                    if (!isEditing) {
                      deleteBuildingDetailsMutation.mutate()
                    } else {
                      setIsEditing(false)
                    }
                  }}
                >
                  {isEditing ? '✕' : '🗑'}
                  {/* this is delete button */}
                </button>
              </div>
            </div>

            <ul>
              {!isEditing && (
                <div className="ViewMode">
                  <li>
                    <b>Total number of Blocks:</b> &nbsp;{memoizedBuildingData?.totalBlocks}
                  </li>
                  <li>
                    <b>Parking Space:</b>&nbsp; {memoizedBuildingData?.parkingSpace}
                  </li>
                  <li>
                    <b>Distance from road:</b> &nbsp;{memoizedBuildingData?.distanceFromRoad}
                  </li>
                  <li>
                    <b>Servant/Guard Room:</b>&nbsp;
                    {memoizedBuildingData?.servantRoom ? 'Available' : 'Not available'}
                  </li>
                  <li>
                    <b>Generator/Solar Power:</b>&nbsp; {memoizedBuildingData?.generator}
                  </li>
                  <li>
                    <b>Water:</b> &nbsp;{memoizedBuildingData?.waterDetails}
                  </li>
                  <li>
                    <b>Gate, Compound details:</b> &nbsp;{memoizedBuildingData?.gateDetails}
                  </li>
                  <li>
                    <b>Price:</b>&nbsp; {memoizedBuildingData?.price}
                  </li>
                  <li>
                    <b>Building owner details:</b>
                    <ul style={{}}>
                      <li>
                        <b>Name:</b> &nbsp;{memoizedBuildingData?.ownerName}
                      </li>
                      <li>
                        <b>Company:</b>&nbsp; {memoizedBuildingData?.ownerCompany}
                      </li>
                      <li>
                        <b>Address:</b>&nbsp; {memoizedBuildingData?.ownerAddress}
                      </li>
                      <li>
                        <b>Contact number (Primary):</b> &nbsp;
                        {memoizedBuildingData?.ownerPrimaryContact}
                      </li>
                      <li>
                        <b>Contact number (Secondary):</b>&nbsp;
                        {memoizedBuildingData?.ownerSecondaryContact}
                      </li>
                    </ul>
                  </li>
                </div>
              )}
              {isEditing && (
                <EditingModeInputFields
                  getChildState={getChildState}
                  currentValue={memoizedBuildingData}
                />
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default Building
