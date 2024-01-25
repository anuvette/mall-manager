import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import './assets/Floor.css';
import AddNewFloorButton from './AddNewFloorButton';
import SpaceComponent from './Space-Component';
import useAuth from './customHooks/useAuth';




const Floor = () => {

  const [activeFloor, setActiveFloor] = useState('1');
  const {usernameInSession, roleInSession, token} = useAuth();


  const floorQuery = useQuery({
    queryKey: ['floorData'],
    queryFn: () => window.electronAPI.getFloorDetails(),
    // refetchOnWindowFocus: false,
  });


 


  const handleFloorChange = (event) => {

    const floorNumber = event.target.id.replace('Floor', '');
    setActiveFloor(floorNumber);

  };

  

  if (floorQuery.isLoading) {
    return (
      <div className="Dashboard" style={{}}>
        <h1>Floors & Spaces</h1>
        <span style={{ color: "gray" }}>Loading...</span>
      </div>
    );
  }

  if (floorQuery.isError) {
    return (
      <div className="Dashboard" style={{}}>
        <h1>Floors & Spaces</h1>
        <span style={{ color: "red" }}>Unexpected Error Occured!</span>
      </div>
    );
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

      <div className='Floors'>
         
        <div className='mother-container'>
        <div className="input-container">
          <input id="Floor1" type="radio" name="Floor" onClick={handleFloorChange} defaultChecked/>
            <label htmlFor="Floor1">Floor 1</label>
        </div>
        </div>

        <div className="mother-container">
        <div className="input-container">
          <input id="Floor2" type="radio" name="Floor" onClick={handleFloorChange}/>
            <label htmlFor="Floor2">Floor 2</label>
        </div>
        </div>

        <div className="mother-container">
        <div className="input-container">
          <input id="Floor3" type="radio" name="Floor" onClick={handleFloorChange}/>
            <label htmlFor="Floor3">Floor 3</label>
        </div>
        </div>

        <div className="mother-container">
        <div className="input-container">
          <input id="Floor4" type="radio" name="Floor" onClick={handleFloorChange}/>
            <label htmlFor="Floor4">Floor 4</label>
        </div>
        </div>
      
      </div>

      <div className="Spaces">
       
        <AddNewFloorButton activeFloor={activeFloor}/>


        {floorQuery.data
        .filter((spaceItem) => spaceItem.floorNumber == activeFloor)
        .sort((a, b) => a.spaceNumber - b.spaceNumber) // Sort by the 'spaceNumber' attribute
        .map((spaceItem) => (
          <SpaceComponent
            key={spaceItem.spaceId}
            spaceItem={spaceItem}
          />
        ))}


      </div>
    </div>
  );
};

export default Floor;