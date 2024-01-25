import React, {useEffect} from "react";
import useQueryParam from "./customHooks/useQueryParameter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "./assets/Docs.css";
import { useNavigate } from "react-router-dom";

function Docs() {
  const leaseId = useQueryParam("leaseId") || 0;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const individualLeaseQuery = useQuery({
    queryKey: ["individualLease"],
    queryFn: () => window.electronAPI.getIndividualLeaseQuery(leaseId),    
  });

  const addPassportPhotoMutation = useMutation({
    mutationFn: (leaseData) => window.electronAPI.addPassportPhoto(leaseData),
    onSuccess: () => {
      console.log("Success");
      queryClient.invalidateQueries(["individualLease"]);
    },
  });

  const addCitizenPhotoMutation = useMutation({
    mutationFn: (leaseData) => window.electronAPI.addCitizenPhoto(leaseData),
    onSuccess: () => {
      //console.log("Success");
      queryClient.invalidateQueries(["individualLease"]);
    },
  });

  const addPANPhotoMutation = useMutation({
    mutationFn: (leaseData) => window.electronAPI.addPANPhoto(leaseData),
    onSuccess: () => {
      //console.log("Success");
      queryClient.invalidateQueries(["individualLease"]);
    },
  });

  const editLeaseMutation = useMutation({
    mutationFn: (leaseData) => window.electronAPI.editExistingLease(leaseData),
    onSuccess: () => {
      console.log("Lease edited successfully");
      queryClient.invalidateQueries(["individualLease"]);
    },
  });

  const deleteLeaseMutation = useMutation({
    mutationFn: () => window.electronAPI.deleteLease(leaseId),
    onSuccess: () => {
      console.log("Lease deleted successfully");
      queryClient.invalidateQueries(["individualLease"]);
      //navigate to home/lease usenavigation hook man
      navigate("/Home/lease");
    },
  });

  const handleImageUpload = async (e, buttonType) => {
    e.preventDefault();

    // If the button type is a delete action, mutate immediately
    if (buttonType.startsWith("delete")) {
      switch (buttonType) {
        case "deletePassportPhoto":
          addPassportPhotoMutation.mutate({ photoPath: null, leaseId });
          break;
        case "deleteCitizenPhoto":
          addCitizenPhotoMutation.mutate({ photoPath: null, leaseId });
          break;
        case "deletePANPhoto":
          addPANPhotoMutation.mutate({ photoPath: null, leaseId });
          break;
        default:
          break;
      }
    } else {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/png, image/jpeg, image/jpg";
      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const filePath = file.path;
        console.log("Selected file path:", filePath);

        // Call the appropriate mutation based on buttonType
        switch (buttonType) {
          case "passportPhoto":
            console.log("Calling addPassportPhotoMutation.mutate");
            addPassportPhotoMutation.mutate({ photoPath: filePath, leaseId });
            break;
          case "citizenPhoto":
            addCitizenPhotoMutation.mutate({ photoPath: filePath, leaseId });
            break;
          case "PANPhoto":
            addPANPhotoMutation.mutate({ photoPath: filePath, leaseId });
            break;
          default:
            break;
        }
      });
      fileInput.click();
    }
  };

  
  const handleEditSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const editData = Object.fromEntries(formData.entries());

    // Add leaseId to form data
    editData.leaseId = leaseId;


    console.log("original data", individualLeaseQuery.data);

    // basically reducing individual query to contain only the properties that exist in edit form and removing unnecessary stuff like photos
    const reducedIndividualLeaseQuerData = Object.keys(individualLeaseQuery.data).reduce((obj, key) => {
      if (key in editData) {
        let value = individualLeaseQuery.data[key];
        if (value === null) {
          value = '';
        } else if (typeof value === 'number') {
          value = value.toString();
        }
        obj[key] = value;
      }
      return obj;
    }, {});

    console.log("edit data", editData);
    console.log("reduced data", reducedIndividualLeaseQuerData);

    function sortedStringify(obj) {
      return JSON.stringify(Object.keys(obj).sort().reduce((result, key) => {   //sorting cuz order is different
        result[key] = obj[key];
        return result;
      }, {}));
    }

    if (sortedStringify(editData) !== sortedStringify(reducedIndividualLeaseQuerData)) {
      console.log('The data has changed');
      editLeaseMutation.mutate(editData);
      document.getElementById("Edit-Modal").close();
    } else {
      console.log('The data has not changed');
    }

    
  };


  const openScanner = () => {
    window.electronAPI.openScanner();
  };

  


  if (individualLeaseQuery.isLoading) {
    return (
      <>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
          }}
        >
          <h1>Documents of Lease Id:{leaseId}</h1>
          <div>Loading...</div>
        </div>
      </>
    );
  }

  if (individualLeaseQuery.isError) {
    return (
      <>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
          }}
        >
          <h1>Documents of Lease Id:{leaseId}</h1>
          <div>{individualLeaseQuery.error.message}</div>
        </div>
      </>
    );
  }

  if (!individualLeaseQuery.data) {
    return (
      <>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
          }}
        >
          <h1>Invalid Lease ID</h1>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
        }}
      >
        <h1>Documents of {individualLeaseQuery.data.firstName} {individualLeaseQuery.data.lastName} (Lease Id:{leaseId})</h1>



        <div className="individual-lease-container">
          <button onClick={openScanner} className= "individual-lease-container__button--scanner" style={{background:'transparent', borderRadius:'0', border:'1px solid white', color:'white'}}> Scanner </button>

          <div className="individual-lease-container__pp-photo  individual-lease-container--image">
            <img
              src={`http://localhost:3000/image/${
                individualLeaseQuery.data?.passportSizePhoto || "default.png"
              }`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "http://localhost:3000/image/default.png";
              }}
            />
            <h1 className="individual-lease-container__header">
              Passport Photo
            </h1>
            <button
              className="individual-lease-container__button--add"
              onClick={(e) => handleImageUpload(e, "passportPhoto")}
            >
              &#43;
            </button>
            
            <button
              className="individual-lease-container__button--delete"
              onClick={(e) => handleImageUpload(e, "deletePassportPhoto")}
            >
              &#128465;
            </button>
          </div>
          <div className="individual-lease-container__info individual-lease-container--formatting">
            <h1>Lease Information</h1>
            <ul style={{ fontWeight: "bold" }}>
              {Object.entries(individualLeaseQuery.data).map(([key, value]) => ( //basically iterating instead of manually writing each line
                 <li key={key}> 
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: {value || "N/A"} 
                </li>    //basic regex to format camelCase to Camel Case
              ))}
            </ul>
            <dialog
              id="Edit-Modal"
              className="individual-lease-container__modal"
              onClick={(event) => {
                const dialog = document.getElementById("Edit-Modal");
                if (event.target === dialog) {
                  dialog.close();
                }
              }}
            >
              <div>
                <h1> Edit Lease Details</h1>
                <form onSubmit={handleEditSubmit}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label htmlFor="firstName">First Name:</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      defaultValue={individualLeaseQuery.data.firstName}
                    />
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      defaultValue={individualLeaseQuery.data.lastName}
                    />
                    <label htmlFor="contact">Contact:</label>
                    <input
                      type="text"
                      id="contact"
                      name="contact"
                      defaultValue={individualLeaseQuery.data.contact}
                    />
                    <label htmlFor="emergency-contact">Emergency Contact:</label>
                    <input
                      type="text"
                      id="emergency-contact"
                      name="contact"
                      defaultValue={individualLeaseQuery.data.emergencyContact}
                    />
                    <label htmlFor="spaceRenting">Space Rented:</label>
                    <input
                      type="text"
                      id="spaceRenting"
                      name="spaceRenting"
                      defaultValue={individualLeaseQuery.data.spaceRenting}
                    />
                    <label htmlFor="floorNumber">Floor Number:</label>
                    <input
                      type="text"
                      id="floorNumber"
                      name="floorNumber"
                      defaultValue={individualLeaseQuery.data.floorNumber}
                    />
                    <label htmlFor="PANNumber">PAN Number:</label>
                    <input
                      type="text"
                      id="PANNumber"
                      name="PANNumber"
                      defaultValue={individualLeaseQuery.data.PANNumber}
                    />
                    <label htmlFor="citizenshipNumber">Citizenship Number:</label>
                    <input
                      type="text"
                      id="citizenshipNumber"
                      name="citizenshipNumber"
                      defaultValue={individualLeaseQuery.data.citizenshipNumber}
                    />
                    <label htmlFor="emergencyContact">Emergency Contact:</label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      defaultValue={individualLeaseQuery.data.emergencyContact}
                    />
                    <label htmlFor="dateOfEffect">Date of Effect:</label>
                    <input
                      type="text"
                      id="dateOfEffect"
                      name="dateOfEffect"
                      defaultValue={individualLeaseQuery.data.dateOfEffect}
                    />
                    <label htmlFor="dateOfExpiry">Date of Expiry:</label>
                    <input
                      type="text"
                      id="dateOfExpiry"
                      name="dateOfExpiry"
                      defaultValue={individualLeaseQuery.data.dateOfExpiry}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                      width: "100%",
                      outline: "",
                    }}
                  >
                    <button style={{ flex: "1" }} type="submit">
                      Submit
                    </button>
                    <button
                      style={{ flex: "1" }}
                      type="button"
                      onClick={() =>
                        document.getElementById("Edit-Modal").close()
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </form>

              </div>
            </dialog>
            <button
              type="button"
              className="individual-lease-container__button--add"
              style={{ fontSize: "4rem", color: "white" }}
              onClick={() => document.getElementById("Edit-Modal").showModal()}
            >
              &#43;
            </button>
            <button
              className="individual-lease-container__button--delete"
              style={{ fontSize: "2rem" }}
              onClick={() => deleteLeaseMutation.mutate()}
            >
              &#128465;
            </button>
          </div>
          <div className="individual-lease-container__citizenship-photo individual-lease-container--image">
            <img
              src={`http://localhost:3000/image/${
                individualLeaseQuery.data.citizenPhoto || "default.png"
              }`}
            />
            <h1 className="individual-lease-container__header">PAN Photo</h1>
            <button
              className="individual-lease-container__button--add"
              onClick={(e) => handleImageUpload(e, "citizenPhoto")}
            >
              &#43;
            </button>
            <button
              className="individual-lease-container__button--delete"
              onClick={(e) => handleImageUpload(e, "deleteCitizenPhoto")}
            >
              &#128465;
            </button>
          </div>
          <div className="individual-lease-container__pancard-photo individual-lease-container--image">
            <img
              src={`http://localhost:3000/image/${
                individualLeaseQuery.data.PANPhoto || "default.png"
              }`}
            />
            <h1 className="individual-lease-container__header">
              Citizenship Photo
            </h1>
            <button
              className="individual-lease-container__button--add"
              onClick={(e) => handleImageUpload(e, "PANPhoto")}
            >
              &#43;
            </button>
            <button
              className="individual-lease-container__button--delete"
              onClick={(e) => handleImageUpload(e, "deletePANPhoto")}
            >
              &#128465;
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Docs;
