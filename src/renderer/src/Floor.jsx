import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import './assets/Floor.css'
import AddNewFloorButton from './AddNewFloorButton'
import SpaceComponent from './Space-Component'
import useAuth from './customHooks/useAuth'
import { AnimatePresence, motion } from 'framer-motion'

const Floor = () => {
  const [activeFloor, setActiveFloor] = useState('1')
  const { usernameInSession, roleInSession, token } = useAuth()

  const floorQuery = useQuery({
    queryKey: ['floorData'],
    queryFn: () => window.electronAPI.getFloorDetails()
    // refetchOnWindowFocus: false,
  })

  const handleFloorChange = (event) => {
    if (event.type === 'change') {
      const floorNumber = event.target.id.replace('Floor', '')
      setActiveFloor(floorNumber)
    } else if (event.type === 'keydown' && event.key >= '1' && event.key <= '4') {
      setActiveFloor(event.key)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleFloorChange)

    return () => {
      window.removeEventListener('keydown', handleFloorChange)
    }
  }, [])

  if (floorQuery.isLoading) {
    return (
      <div className="Dashboard" style={{}}>
        <h1>Floors & Spaces</h1>
        <span style={{ color: 'gray' }}>Loading...</span>
      </div>
    )
  }

  if (floorQuery.isError) {
    return (
      <div className="Dashboard" style={{}}>
        <h1>Floors & Spaces</h1>
        <span style={{ color: 'red' }}>Unexpected Error Occured!</span>
      </div>
    )
  }

  // const { token } = useContext(AuthContext);
  // const { usernameInSession } = useContext(AuthContext);

  // useEffect(() => {
  //   console.log('Token:', token);
  //   console.log('username', usernameInSession);
  // }, []);

  return (
    <div className="Dashboard">
      <h1>Floors & Spaces</h1>

      <div className="Floors">
        <div className="mother-container">
          <div className="input-container">
            <input
              id="Floor1"
              type="radio"
              name="Floor"
              onClick={handleFloorChange}
              onChange={handleFloorChange}
              checked={activeFloor === '1'}
            />
            <label htmlFor="Floor1">Floor 1</label>
          </div>
        </div>

        <div className="mother-container">
          <div className="input-container">
            <input
              id="Floor2"
              type="radio"
              name="Floor"
              onChange={handleFloorChange}
              checked={activeFloor === '2'}
            />
            <label htmlFor="Floor2">Floor 2</label>
          </div>
        </div>

        <div className="mother-container">
          <div className="input-container">
            <input
              id="Floor3"
              type="radio"
              name="Floor"
              onChange={handleFloorChange}
              checked={activeFloor === '3'}
            />
            <label htmlFor="Floor3">Floor 3</label>
          </div>
        </div>

        <div className="mother-container">
          <div className="input-container">
            <input
              id="Floor4"
              type="radio"
              name="Floor"
              onChange={handleFloorChange}
              checked={activeFloor === '4'}
            />
            <label htmlFor="Floor4">Floor 4</label>
          </div>
        </div>
      </div>

      <div className="Spaces">
        <AddNewFloorButton activeFloor={activeFloor} />

        <AnimatePresence>
          {floorQuery.data
            .filter((spaceItem) => spaceItem.floorNumber == activeFloor)
            .sort((a, b) => a.spaceNumber - b.spaceNumber)
            .map((spaceItem) => (
              <motion.div key={spaceItem.spaceId} layout exit={{ opacity: 0, x: '-100%' }}>
                <SpaceComponent spaceItem={spaceItem} />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Floor
