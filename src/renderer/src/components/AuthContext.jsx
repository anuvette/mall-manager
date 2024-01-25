import React, { useState, createContext } from 'react';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [usernameInSession, setUsernameInSession] = useState(null);
  const [userId, setUserId] = useState(null);
  const [roleInSession, setRoleInSession] = useState(null);

  return (
    <AuthContext.Provider value={{ token, setToken,  usernameInSession, setUsernameInSession, userId, setUserId, roleInSession, setRoleInSession }}>
      {children}
    </AuthContext.Provider>
  );
};