import React, { useState } from 'react'
import { HashLink } from 'react-router-hash-link'
import './assets/CustomTextCarousel.css'

const CustomTextCarousel = ({ header, textCount, textDetails, warningColor, buttonStatus }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  const handleActiveSlideIndexChange = (newIndex) => {
    setActiveSlideIndex(newIndex)
  }

  const handleScroll = (event) => {
    const { scrollLeft, clientWidth, scrollWidth } = event.target

    if (scrollWidth > clientWidth) {
      const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100
      const numberOfElements = textDetails.length
      const newIndex = Math.min(
        Math.floor(scrollPercentage / (100 / numberOfElements)),
        numberOfElements - 1
      )
      setActiveSlideIndex(newIndex)
    }
  }

  // console.log('textDetails', textDetails)

  return (
    <div className="CustomTextCarousel">
      <div className="CustomTextCarousel__Container" onScroll={handleScroll}>
        {!textDetails || Object.keys(textDetails).length !== 0 ? (
          (Array.isArray(textDetails) ? textDetails : [textDetails]).map((textDetail, i) => (
            <div className="CustomTextCarousel__Slide" id={`textDetail-${i}`} key={i}>
              <div className="CustomTextCarousel__Content">
                <h1 style={{ color: warningColor }}>{header}</h1>
                {Object.entries(textDetail).map(([key, value]) => (
                  <p key={key}>
                    {key.replace(/^./, key[0].toUpperCase()).replace(/([a-z\s])([A-Z])/g, '$1 $2')}:{' '}
                    {value}
                  </p>
                ))}
                {/* Add more paragraphs as needed */}
              </div>
              <div className="CustomTextCarousel__ButtonContainer">
                <button
                  style={{
                    fontSize: '4rem',
                    color: 'white',
                    cursor: buttonStatus === 'disabled' ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    // Handle text upload here (if needed)
                  }}
                  disabled={buttonStatus === 'disabled'}
                >
                  &#43; {/* This is the "add" button */}
                </button>
                <button
                  style={{
                    fontSize: '3rem',
                    color: 'white',
                    cursor: buttonStatus === 'disabled' ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    // Handle text edit here (if needed)
                  }}
                  disabled={buttonStatus === 'disabled'}
                >
                  &#x270E; {/* This is the "edit" button */}
                </button>
                <button
                  style={{
                    fontSize: '3rem',
                    color: 'red',
                    cursor: buttonStatus === 'disabled' ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    // Handle text delete here (if needed)
                  }}
                  disabled={buttonStatus === 'disabled'}
                >
                  &#x1F5D1; {/* This is the "delete" button */}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="CustomTextCarousel__Slide" id="slide-1">
            <div className="CustomTextCarousel__Content">
              <h1 style={{ color: warningColor }}>{header}</h1>
              <p>N/A</p>
            </div>
            <div className="CustomTextCarousel__ButtonContainer">
              <button
                style={{
                  fontSize: '4rem',
                  color: 'white',
                  cursor: buttonStatus === 'disabled' ? 'not-allowed' : 'pointer'
                }}
                onClick={() => {
                  // Handle default text upload here (if needed)
                }}
                disabled={buttonStatus === 'disabled'}
              >
                &#43; {/* This is the "add" button */}
              </button>
            </div>
          </div>
        )}
      </div>
      {(Array.isArray(textDetails) ? textDetails.length : 1) > 1 && (
        <div className="CustomTextCarousel__Nav">
          {(Array.isArray(textDetails) ? textDetails : [textDetails]).map((textDetail, i) => (
            <HashLink
              smooth
              to={`#textDetail-${i}`}
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
            ></HashLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomTextCarousel
