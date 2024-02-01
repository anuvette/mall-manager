// Access Electron modules
const { contextBridge, ipcRenderer, dialog } = require('electron')
const path = require('path')

// Create an object with methods to expose to the renderer process
const electronAPI = {
  authenticateUser: async (username, password) => {
    // console.log("username", username);
    // console.log("password", password);

    try {
      const token = await ipcRenderer.invoke('authenticate-user', {
        username,
        password
      })
      // console.log("Authentication status:", token);
      return token
    } catch (error) {
      // console.error("Authentication failed", error);
      throw error
    }
  },

  getUserDetails: async (token, usernameInSession, userId) => {
    try {
      const result = await ipcRenderer.invoke('get-user-details', token, usernameInSession, userId)
      // console.log('Result from get-user-details', result)
      return result
    } catch (error) {
      // console.error('Error getting user details:', error)
      throw error
    }
  },

  getUserDetail: async (token, usernameInSession, userId) => {
    try {
      const result = await ipcRenderer.invoke('get-user-detail', token, usernameInSession, userId)
      // console.log('Result from get-user-details', result)
      return result
    } catch (error) {
      // console.error('Error getting user details:', error)
      throw error
    }
  },

  addUserDetails: async (token, usernameInSession, userId, userData) => {
    try {
      const result = await ipcRenderer.invoke(
        'add-user-details',
        token,
        usernameInSession,
        userId,
        userData
      )
      //console.log('Result from add-user-details', result)
      return result
    } catch (error) {
      //console.error('Error adding user details:', error)
      throw error
    }
  },

  updateUserDetails: async (token, usernameInSession, userId, userData) => {
    try {
      const result = await ipcRenderer.invoke(
        'update-user-details',
        token,
        usernameInSession,
        userId,
        userData
      )
      //console.log('Result from update-user-details', result)
      return result
    } catch (error) {
      //console.error('Error updating user details:', error)
      throw error
    }
  },

  updateUserDetail: async (token, usernameInSession, userId, userData) => {
    try {
      const result = await ipcRenderer.invoke(
        'update-user-detail',
        token,
        usernameInSession,
        userId,
        userData
      )
      //console.log('Result from update-user-details', result)
      return result
    } catch (error) {
      //console.error('Error updating user details:', error)
      throw error
    }
  },

  deleteUserDetails: async (token, usernameInSession, userId, userIds) => {
    try {
      const result = await ipcRenderer.invoke(
        'delete-user-details',
        token,
        usernameInSession,
        userId,
        userIds
      )
      //console.log('Result from delete-user-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting user details:', error)
      throw error
    }
  },

  getFloorDetails: async () => {
    try {
      const response = await ipcRenderer.invoke('get-floor-details')
      //console.log("Floor details fetched", response);
      return response
    } catch (error) {
      //console.error("Floor details fetch failed", error);
      throw error
    }
  },

  addNewSpace: async (spaceData) => {
    //console.log("space data from preload", spaceData);

    try {
      const result = await ipcRenderer.invoke('add-new-space', spaceData)
      //console.log('Result from add-new-space', result)
      return result
    } catch (error) {
      //console.error('Error adding new space:', error)
      throw error
    }
  },

  deleteSpace: async (spaceId) => {
    //console.log('space id from preload', spaceId)
    try {
      const result = await ipcRenderer.invoke('delete-space', spaceId)
      //console.log('Result from delete-space', result)
      return result
    } catch (error) {
      //console.error('Error deleting space:', error)
      throw error
    }
  },

  getLeaseTableDetails: async () => {
    try {
      const response = await ipcRenderer.invoke('get-lease-table-details')
      //console.log("Lease table details fetched", response);
      return response
    } catch (error) {
      //console.error("Lease table details fetch failed", error);
      throw error
    }
  },

  addNewLease: async (leaseData) => {
    //console.log("lease data from preload", leaseData);

    try {
      const result = await ipcRenderer.invoke('add-new-lease', leaseData)
      //console.log('Result from add-new-lease', result)
      return result
    } catch (error) {
      //console.error('Error adding new lease:', error)
      throw error
    }
  },

  editExistingLease: async (leaseData) => {
    //console.log("lease data from preload", leaseData);

    try {
      const result = await ipcRenderer.invoke('edit-existing-lease', leaseData)
      //console.log('Result from edit-existing-lease', result)
      return result
    } catch (error) {
      //console.error('Error editing existing lease:', error)
      throw error
    }
  },

  deleteLease: async (leaseId) => {
    //console.log('lease id from preload', leaseId)
    try {
      const result = await ipcRenderer.invoke('delete-lease', leaseId)
      //console.log('Result from delete-lease', result)
      return result
    } catch (error) {
      //console.error('Error deleting lease:', error)
      throw error
    }
  },

  getIndividualLeaseQuery: async (leaseId) => {
    //console.log('lease id from preload', leaseId)
    try {
      const result = await ipcRenderer.invoke('get-individual-lease-query', leaseId)
      //console.log('Result from individual-lease-query', result)
      return result
    } catch (error) {
      //console.error('Error querying lease:', error)
      throw error
    }
  },

  addPassportPhoto: async (passportPhoto) => {
    //console.log("passportPhoto from preload", passportPhoto);

    try {
      const result = await ipcRenderer.invoke('add-passport-photo', passportPhoto)
      //console.log('Result from add-passport-photo', result)
      return result
    } catch (error) {
      //console.error('Error adding passport photo:', error)
      throw error
    }
  },

  addCitizenPhoto: async (citizenPhoto) => {
    //console.log("citizenPhoto from preload", citizenPhoto);

    try {
      const result = await ipcRenderer.invoke('add-citizen-photo', citizenPhoto)
      //console.log('Result from add-citizen-photo', result)
      return result
    } catch (error) {
      //console.error('Error adding citizen photo:', error)
      throw error
    }
  },

  addPANPhoto: async (PANPhoto) => {
    //console.log("PANPhoto from preload", PANPhoto);

    try {
      const result = await ipcRenderer.invoke('add-PAN-photo', PANPhoto)
      //console.log('Result from add-PAN-photo', result)
      return result
    } catch (error) {
      //console.error('Error adding PAN photo:', error)
      throw error
    }
  },

  getIncomeTableDetails: async (userId) => {
    try {
      const response = await ipcRenderer.invoke('get-income-details', userId)
      //console.log('Income details fetched', response)
      return response
    } catch (error) {
      //console.error("Income details fetch failed", error);
      throw error
    }
  },

  getExpenditureTableDetails: async (userId) => {
    try {
      const response = await ipcRenderer.invoke('get-expenditure-details', userId)
      //console.log("Expenditure details fetched", response);
      return response
    } catch (error) {
      //console.error("Expenditure details fetch failed", error);
      throw error
    }
  },

  addIncomeTableDetails: async (incomeData) => {
    //console.log('income data from preload', incomeData)

    try {
      const result = await ipcRenderer.invoke('add-income-details', incomeData)
      //console.log('Result from add-income-details', result)
      return result
    } catch (error) {
      //console.error('Error adding income details:', error)
      throw error
    }
  },

  addExpenditureTableDetails: async (expenditureData) => {
    //console.log("expenditure data from preload", expenditureData);

    try {
      const result = await ipcRenderer.invoke('add-expenditure-details', expenditureData)
      //console.log('Result from add-expenditure-details', result)
      return result
    } catch (error) {
      //console.error('Error adding expenditure details:', error)
      throw error
    }
  },

  updateIncomeTableDetails: async (incomeData) => {
    //console.log('income data from preload', incomeData)

    try {
      const result = await ipcRenderer.invoke('update-income-details', incomeData)
      //console.log('Result from update-income-details', result)
      return result
    } catch (error) {
      //console.error('Error updating income details:', error)
      throw error
    }
  },

  updateExpenditureTableDetails: async (expenditureData) => {
    //console.log("expenditure data from preload", expenditureData);

    try {
      const result = await ipcRenderer.invoke('update-expenditure-details', expenditureData)
      //console.log('Result from update-expenditure-details', result)
      return result
    } catch (error) {
      //console.error('Error updating expenditure details:', error)
      throw error
    }
  },

  deleteIncomeTableDetails: async (incomeData) => {
    //console.log('income id from preload', incomeData)
    try {
      const result = await ipcRenderer.invoke('delete-income-details', incomeData)
      //console.log('Result from delete-income-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting income details:', error)
      throw error
    }
  },

  deleteExpenditureTableDetails: async (expenditureData) => {
    //console.log('expenditure id from preload', expenditureData)
    try {
      const result = await ipcRenderer.invoke('delete-expenditure-details', expenditureData)
      //console.log('Result from delete-expenditure-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting expenditure details:', error)
      throw error
    }
  },

  getBuildingDetails: async () => {
    try {
      const response = await ipcRenderer.invoke('get-building-details')
      //console.log('Building details fetched', response)
      return response
    } catch (error) {
      //console.error("Building details fetch failed", error);
      throw error
    }
  },

  updateBuildingDetails: async (buildingData) => {
    //console.log('building data from preload', buildingData)

    try {
      const result = await ipcRenderer.invoke('update-building-details', buildingData)
      //console.log('Result from update-building-details', result)
      return result
    } catch (error) {
      //console.error('Error updating building details:', error)
      throw error
    }
  },

  deleteAllBuildingDetails: async () => {
    try {
      const result = await ipcRenderer.invoke('delete-all-building-details')
      //console.log('Result from delete-all-building-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting all building details:', error)
      throw error
    }
  },

  getBuildingImageDetails: async () => {
    try {
      const response = await ipcRenderer.invoke('get-building-image-details')
      //console.log('Building image details fetched', response)
      return response
    } catch (error) {
      //console.error("Building image details fetch failed", error);
      throw error
    }
  },

  addBuildingImageDetails: async (buildingImageData) => {
    //console.log("buildingImageData from preload", buildingImageData);

    try {
      const result = await ipcRenderer.invoke('add-building-image-details', buildingImageData)
      //console.log('Result from add-building-image-details', result)
      return result
    } catch (error) {
      //console.error('Error adding building image details:', error)
      throw error
    }
  },

  updateBuildingImageDetails: async (buildingImageData) => {
    //console.log('buildingImageData from preload', buildingImageData)

    try {
      const result = await ipcRenderer.invoke('update-building-image-details', buildingImageData)
      //console.log('Result from update-building-image-details', result)
      return result
    } catch (error) {
      //console.error('Error updating building image details:', error)
      throw error
    }
  },

  deleteBuildingImageDetails: async (buildingImageData) => {
    //console.log('buildingImageData from preload', buildingImageData)
    try {
      const result = await ipcRenderer.invoke('delete-building-image-details', buildingImageData)
      //console.log('Result from delete-building-image-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting building image details:', error)
      throw error
    }
  },

  getLeaseDetailsUserName: async (token, usernameInSession) => {
    try {
      const response = await ipcRenderer.invoke(
        'get-lease-details-username',
        token,
        usernameInSession
      )
      //console.log('Lease details fetched', response)
      return response
    } catch (error) {
      //console.error("Lease details fetch failed", error);
      throw error
    }
  },

  getTaxManagerImageDetails: async (token, usernameInSession, leaseId) => {
    console.log('usernameInSession from preload', usernameInSession, token, leaseId)
    try {
      const response = await ipcRenderer.invoke(
        'get-tax-manager-image-details',
        token,
        usernameInSession,
        leaseId
      )
      //console.log('Tax manager image details fetched', response)
      return response
    } catch (error) {
      //console.error('Tax manager image details fetch failed', error)
      throw error
    }
  },

  addTaxManagerImageDetails: async (token, usernameInSession, taxManagerImageData) => {
    // console.log('taxManagerImageData from preload', token, usernameInSession, taxManagerImageData)

    try {
      const result = await ipcRenderer.invoke(
        'add-tax-manager-image-details',
        token,
        usernameInSession,
        taxManagerImageData
      )
      //console.log('Result from add-tax-manager-image-details', result)
      return result
    } catch (error) {
      //console.error('Error adding tax manager image details:', error)
      throw error
    }
  },

  updateTaxManagerImageDetails: async (token, usernameInSession, taxManagerImageData) => {
    // console.log('taxManagerImageData from preload', token, usernameInSession, taxManagerImageData)

    try {
      const result = await ipcRenderer.invoke(
        'update-tax-manager-image-details',
        token,
        usernameInSession,
        taxManagerImageData
      )
      //console.log('Result from update-tax-manager-image-details', result)
      return result
    } catch (error) {
      //console.error('Error updating tax manager image details:', error)
      throw error
    }
  },

  deleteTaxManagerImageDetails: async (token, usernameInSession, spaceImageId) => {
    //console.log('taxManagerImageData from preload', token, usernameInSession, spaceImageId)
    try {
      const result = await ipcRenderer.invoke(
        'delete-tax-manager-image-details',
        token,
        usernameInSession,
        spaceImageId
      )
      //console.log('Result from delete-tax-manager-image-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting tax manager image details:', error)
      throw error
    }
  },

  getPettyDetails: async (token, usernameInSession, userId) => {
    try {
      const result = await ipcRenderer.invoke('get-petty-details', token, usernameInSession, userId)
      // console.log('Result from get-petty-details', result)
      return result
    } catch (error) {
      //console.error('Error getting petty details:', error)
      throw error
    }
  },

  getCashAccountDetails: async (token, usernameInSession, userId) => {
    try {
      const result = await ipcRenderer.invoke(
        'get-cash-account-details',
        token,
        usernameInSession,
        userId
      )
      // console.log('Result from get-cash-account-details', result)
      return result
    } catch (error) {
      //console.error('Error getting cash account details:', error)
      throw error
    }
  },

  addPettyDetails: async (token, usernameInSession, userId, pettyData) => {
    try {
      const result = await ipcRenderer.invoke(
        'add-petty-details',
        token,
        usernameInSession,
        userId,
        pettyData
      )
      //console.log('Result from add-petty-details', result)
      return result
    } catch (error) {
      //console.error('Error adding petty details:', error)
      throw error
    }
  },

  addCashAccountDetails: async (token, usernameInSession, userId, cashAccountData) => {
    try {
      const result = await ipcRenderer.invoke(
        'add-cash-account-details',
        token,
        usernameInSession,
        userId,
        cashAccountData
      )
      //console.log('Result from add-cash-account-details', result)
      return result
    } catch (error) {
      //console.error('Error adding cash account details:', error)
      throw error
    }
  },

  updatePettyDetails: async (token, usernameInSession, userId, pettyData) => {
    try {
      const result = await ipcRenderer.invoke(
        'update-petty-details',
        token,
        usernameInSession,
        userId,
        pettyData
      )
      //console.log('Result from update-petty-details', result)
      return result
    } catch (error) {
      //console.error('Error updating petty details:', error)
      throw error
    }
  },

  updateCashAccountDetails: async (token, usernameInSession, userId, cashAccountData) => {
    try {
      const result = await ipcRenderer.invoke(
        'update-cash-account-details',
        token,
        usernameInSession,
        userId,
        cashAccountData
      )
      //console.log('Result from update-cash-account-details', result)
      return result
    } catch (error) {
      //console.error('Error updating cash account details:', error)
      throw error
    }
  },

  deletePettyDetails: async (token, usernameInSession, userId, pettyIds) => {
    try {
      const result = await ipcRenderer.invoke(
        'delete-petty-details',
        token,
        usernameInSession,
        userId,
        pettyIds
      )
      //console.log('Result from delete-petty-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting petty details:', error)
      throw error
    }
  },

  deleteCashAccountDetails: async (token, usernameInSession, userId, cashAccountIds) => {
    try {
      const result = await ipcRenderer.invoke(
        'delete-cash-account-details',
        token,
        usernameInSession,
        userId,
        cashAccountIds
      )
      //console.log('Result from delete-cash-account-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting cash account details:', error)
      throw error
    }
  },

  getPayableDetails: async (token, usernameInSession, userId) => {
    try {
      const result = await ipcRenderer.invoke(
        'get-payable-details',
        token,
        usernameInSession,
        userId
      )
      // console.log('Result from get-payable-details', result)
      return result
    } catch (error) {
      //console.error('Error getting payable details:', error)
      throw error
    }
  },

  getReceivableDetails: async (token, usernameInSession, userId) => {
    try {
      const result = await ipcRenderer.invoke(
        'get-receivable-details',
        token,
        usernameInSession,
        userId
      )
      // console.log('Result from get-receivable-details', result)
      return result
    } catch (error) {
      //console.error('Error getting receivable details:', error)
      throw error
    }
  },

  addPayableDetails: async (token, usernameInSession, userId, payableData) => {
    try {
      const result = await ipcRenderer.invoke(
        'add-payable-details',
        token,
        usernameInSession,
        userId,
        payableData
      )
      //console.log('Result from add-payable-details', result)
      return result
    } catch (error) {
      //console.error('Error adding payable details:', error)
      throw error
    }
  },

  addReceivableDetails: async (token, usernameInSession, userId, receivableData) => {
    try {
      const result = await ipcRenderer.invoke(
        'add-receivable-details',
        token,
        usernameInSession,
        userId,
        receivableData
      )
      //console.log('Result from add-receivable-details', result)
      return result
    } catch (error) {
      //console.error('Error adding receivable details:', error)
      throw error
    }
  },

  updatePayableDetails: async (token, usernameInSession, userId, payableData) => {
    try {
      const result = await ipcRenderer.invoke(
        'update-payable-details',
        token,
        usernameInSession,
        userId,
        payableData
      )
      //console.log('Result from update-payable-details', result)
      return result
    } catch (error) {
      //console.error('Error updating payable details:', error)
      throw error
    }
  },

  updateReceivableDetails: async (token, usernameInSession, userId, receivableData) => {
    try {
      const result = await ipcRenderer.invoke(
        'update-receivable-details',
        token,
        usernameInSession,
        userId,
        receivableData
      )
      //console.log('Result from update-receivable-details', result)
      return result
    } catch (error) {
      //console.error('Error updating receivable details:', error)
      throw error
    }
  },

  deletePayableDetails: async (token, usernameInSession, userId, payableIds) => {
    try {
      const result = await ipcRenderer.invoke(
        'delete-payable-details',
        token,
        usernameInSession,
        userId,
        payableIds
      )
      //console.log('Result from delete-payable-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting payable details:', error)
      throw error
    }
  },

  deleteReceivableDetails: async (token, usernameInSession, userId, receivableIds) => {
    try {
      const result = await ipcRenderer.invoke(
        'delete-receivable-details',
        token,
        usernameInSession,
        userId,
        receivableIds
      )
      //console.log('Result from delete-receivable-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting receivable details:', error)
      throw error
    }
  },

  getAdvanceDetails: async (token, usernameInSession, userId) => {
    try {
      const result = await ipcRenderer.invoke(
        'get-advance-details',
        token,
        usernameInSession,
        userId
      )
      // console.log('Result from get-advance-details', result)
      return result
    } catch (error) {
      //console.error('Error getting advance details:', error)
      throw error
    }
  },

  addAdvanceDetails: async (token, usernameInSession, userId, advanceData) => {
    try {
      const result = await ipcRenderer.invoke(
        'add-advance-details',
        token,
        usernameInSession,
        userId,
        advanceData
      )
      //console.log('Result from add-advance-details', result)
      return result
    } catch (error) {
      //console.error('Error adding advance details:', error)
      throw error
    }
  },

  updateAdvanceDetails: async (token, usernameInSession, userId, advanceData) => {
    try {
      const result = await ipcRenderer.invoke(
        'update-advance-details',
        token,
        usernameInSession,
        userId,
        advanceData
      )
      //console.log('Result from update-advance-details', result)
      return result
    } catch (error) {
      //console.error('Error updating advance details:', error)
      throw error
    }
  },

  deleteAdvanceDetails: async (token, usernameInSession, userId, advanceIds) => {
    try {
      const result = await ipcRenderer.invoke(
        'delete-advance-details',
        token,
        usernameInSession,
        userId,
        advanceIds
      )
      //console.log('Result from delete-advance-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting advance details:', error)
      throw error
    }
  },

  getSalaryIncentivesDetails: async (token, usernameInSession, userId) => {
    try {
      const result = await ipcRenderer.invoke(
        'get-salary-incentives-details',
        token,
        usernameInSession,
        userId
      )
      // console.log('Result from get-salary-incentive-details', result)
      return result
    } catch (error) {
      //console.error('Error getting salary incentive details:', error)
      throw error
    }
  },

  updateSalaryIncentivesDetails: async (token, usernameInSession, userId, salaryIncentivesData) => {
    try {
      const result = await ipcRenderer.invoke(
        'update-salary-incentives-details',
        token,
        usernameInSession,
        userId,
        salaryIncentivesData
      )
      //console.log('Result from update-salary-incentives-details', result)
      return result
    } catch (error) {
      //console.error('Error updating salary incentive details:', error)
      throw error
    }
  },

  getAllFacilityDetails: async (token, usernameInSession) => {
    try {
      const result = await ipcRenderer.invoke('get-all-facility-details', token, usernameInSession)
      // console.log('Result from get-all-facility-details', result)
      return result
    } catch (error) {
      //console.error('Error getting all facility details:', error)
      throw error
    }
  },

  addFacilityDetails: async (token, usernameInSession, facilityData) => {
    try {
      const result = await ipcRenderer.invoke(
        'add-facility-details',
        token,
        usernameInSession,
        facilityData
      )
      //console.log('Result from add-facility-details', result)
      return result
    } catch (error) {
      //console.error('Error adding facility details:', error)
      throw error
    }
  },

  updateFacilityDetails: async (token, usernameInSession, facilityData) => {
    try {
      const result = await ipcRenderer.invoke(
        'update-facility-details',
        token,
        usernameInSession,
        facilityData
      )
      //console.log('Result from update-facility-details', result)
      return result
    } catch (error) {
      //console.error('Error updating facility details:', error)
      throw error
    }
  },

  deleteFacilityDetails: async (token, usernameInSession, facilityIds) => {
    try {
      const result = await ipcRenderer.invoke(
        'delete-facility-details',
        token,
        usernameInSession,
        facilityIds
      )
      //console.log('Result from delete-facility-details', result)
      return result
    } catch (error) {
      //console.error('Error deleting facility details:', error)
      throw error
    }
  },

  printDocument: (leaseDetails, ownerFullName) => {
    //console.log('lease details from preload', leaseDetails)
    ipcRenderer.send('print-document', leaseDetails, ownerFullName)
  },
  openScanner: () => {
    //console.log('log from openScanner preload')
    ipcRenderer.send('open-scanner')
  },

  exportBackupFolder: async (options) => {
    try {
      const response = await ipcRenderer.invoke('export-backup-folder', options)
      return response
    } catch (error) {
      //console.error('Error invoking export-backup-folder:', error)
      return { success: false, error: error.message }
    }
  },
  exportBackup: (token, usernameInSession, backupFolderPath) => {
    //console.log('log from exportBackup preload')
    return ipcRenderer.invoke('export-backup', token, usernameInSession, backupFolderPath)
  },

  importBackup: () => {
    try {
      ipcRenderer.send('import-backup')
    } catch (error) {
      //console.error('Error sending import-backup:', error)
    }
  },

  logout: (token, userInSession) => {
    const invalidatedToken = ipcRenderer.send('logout', token, userInSession)
    return invalidatedToken
  }
}

// Expose the 'electronAPI' object to the window object in the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)
