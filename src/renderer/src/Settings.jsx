import React from "react";
import "./assets/Settings.css";

const Settings = () => {
    return(
        <div style={{display:'flex', flexDirection:'column',minHeight:'100%', width:'100%', overflow:'scroll',padding:'10px'}}>
            
            <div className="settings-header">
                <h1 style={{}}>Settings</h1>
            </div>


            <div className="settings-container">

                <div style={{border:'1px solid white', borderRadius:'20px',width:'min(100%,500px)', padding:'20px'}}>

                    <div className="settings-info">
                        <h2>Username: Anu</h2>
                        <h3>Contact: 9846754321</h3>
                        <h3>PAN: ABCXYZN00</h3>
                    </div>

                    <form>
                        <div className="settings-body">
                            <div style={{display:'flex', flexDirection:'column',paddingTop:''}}>
                                <label>Name:</label>
                                <input placeholder="Anu Bhattarai(Cannot Change)" disabled></input>
                            </div>
                            <div style={{display:'flex', flexDirection:'column'}}>
                                <label>Username:</label>
                                <input placeholder="Change Username..." ></input>
                            </div>
                            <div style={{display:'flex', flexDirection:'column'}}>
                                <label>Password:</label>
                                <input placeholder="Change Password..." ></input>
                            </div>
                            <div className="settings-button-container">
                                <button>Save</button>
                                <button>Discard</button>
                            </div>
                        </div>
                    </form>

                </div>

            </div>

        </div>
    );
};

export default Settings;