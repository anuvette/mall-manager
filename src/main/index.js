import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const fs = require('fs')
const fsPromise = require('fs').promises
const fsExtra = require('fs-extra')
const path = require('path')
const PDFDocument = require('pdfkit')
const dbQueries = require('../../database/databaseModel.js')
const secretKey = crypto.randomBytes(64).toString('hex')
const express = require('express')
const axios = require('axios')

const expressImageServer = express()
let mainWindow
let mainToken = null
let pdfViewerWindow = null
function pdfProcessor(leaseDetails) {
  console.log('leasedeails', leaseDetails)
  const diffInMonths =
    (new Date(leaseDetails.dateOfExpiry).getFullYear() -
      new Date(leaseDetails.dateOfEffect).getFullYear()) *
      12 +
    (new Date(leaseDetails.dateOfExpiry).getMonth() -
      new Date(leaseDetails.dateOfEffect).getMonth())

  const doc = new PDFDocument()

  // Pipe the PDF output to a writable stream
  const currentDate = new Date().toDateString()
  const pdfPath = `${app.getPath('temp')}/temp_${currentDate}.pdf`
  const writeStream = fs.createWriteStream(pdfPath)
  doc.pipe(writeStream)

  // Add leaseDetails to the PDF
  doc.fontSize(16).font('Helvetica-Bold').text('RENTAL AGREEMENT', { align: 'center' }).moveDown()
  doc
    .fontSize(12)
    .font('Helvetica')
    .text('This Rental Agreement is made and entered into on ', { continued: true })
    .font('Helvetica-Bold')
    .text(`${leaseDetails.dateOfEffect},`, { align: 'left' })
    .font('Helvetica')
    .moveDown()
  doc
    .fontSize(12)
    .text('by and between ', { continued: true })
    .font('Helvetica-Bold')
    .text('John Doe (Landlord)', { continued: true })
    .font('Helvetica')
    .text(' , and ', { continued: true })
    .font('Helvetica-Bold')
    .text(`${leaseDetails.firstName} ${leaseDetails.lastName}(Tenant).`)
    .moveDown()
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Property: ', { continued: true })
    .font('Helvetica')
    .text(
      'Landlord agrees to rent to Tenant, and Tenant agrees to rent from Landlord, the property located at',
      { continued: true }
    )
    .font('Helvetica-Bold')
    .text(' Kathmandu, Nepal.')
    .moveDown()
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Term: ', { continued: true })
    .font('Helvetica')
    .text('The term of this Agreement shall be ', { continued: true })
    .font('Helvetica-Bold')
    .text(`${diffInMonths}`, { continued: true })
    .font('Helvetica')
    .text(' months , commencing on ', { continued: true })
    .font('Helvetica-Bold')
    .text(`${leaseDetails.dateOfEffect}`, { continued: true })
    .font('Helvetica')
    .text(' and ending on ', { continued: true })
    .font('Helvetica-Bold')
    .text(`${leaseDetails.dateOfExpiry}.`)
    .moveDown()
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Rent: ', { continued: true })
    .font('Helvetica')
    .text('Tenant shall pay Landlord the sum of ', { continued: true })
    .font('Helvetica-Bold')
    .text('Rs. 6,00,000', { continued: true })
    .font('Helvetica')
    .text(' as rent for the Property, payable in monthly installments of ', { continued: true })
    .font('Helvetica-Bold')
    .text('Rs. 50,000.', { continued: true })
    .font('Helvetica')
    .text(
      ' Rent is due on the first day of each month and shall be considered late if not received by the 5th of the month.'
    )
    .moveDown()
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Security Deposit: ', { continued: true })
    .font('Helvetica')
    .text('Tenant shall pay Landlord a security deposit of Rs. 50,000/-, ', { continued: true })
    .text('which', { continued: true })
    .font('Helvetica')
    .text(' shall be refundable at the end of the tenancy, less any damages or unpaid rent.')
    .moveDown()
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Utilities: ', { continued: true })
    .font('Helvetica')
    .text('Tenant shall be responsible for paying for all utilities and services related to the', {
      continued: true
    })
    .font('Helvetica')
    .text(' Property, including electricity, gas, water, trash, and internet/cable.')
    .moveDown()
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Repair and Maintenance: ', { continued: true })
    .font('Helvetica')
    .text('Landlord shall be responsible for maintaining and repairing the', { continued: true })
    .text(
      " Property, except for damages caused by Tenant or Tenant's guests. Tenant shall notify Landlord",
      { continued: true }
    )
    .text(' in writing of any needed repairs or maintenance.')
    .moveDown()
  //untested
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Use of Property: ', { continued: true })
    .font('Helvetica')
    .text(
      "Tenant shall use the Property only as an office space and shall not use it for any illegal purposes. Tenant shall not sublet the Property or allow any other person to live there without Landlord's written consent."
    )
    .moveDown()
    .font('Helvetica-Bold')
    .text('Rules and Regulations: ', { continued: true })
    .font('Helvetica')
    .text(
      'Tenant shall comply with all rules and regulations set forth in this Agreement and any additional rules or regulations that Landlord may reasonably impose.'
    )
    .moveDown()
    .font('Helvetica-Bold')
    .text('Termination: ', { continued: true })
    .font('Helvetica')
    .text(
      "This Agreement may be terminated by either party upon 30 days' written notice if the other party breaches any material term or condition of this Agreement."
    )
    .moveDown()
    .font('Helvetica-Bold')
    .text('Governing Law: ', { continued: true })
    .font('Helvetica')
    .text('This Agreement shall be governed by the laws of Nepal.')
    .moveDown()
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(
      'IN WITNESS WHEREOF, the parties have executed this Agreement on the date and year first above written.'
    )
    .moveDown()
    .moveDown()
    .moveDown()
  doc
    .font('Helvetica')
    .text('LANDLORD', { continued: true })
    .text(' '.repeat(100), { continued: true }) // 50 spaces for justification
    .text('TENANT')
    .moveDown()

  // Finalize the PDF document
  doc.end()

  // Open a new window with the temporary PDF file
  writeStream.on('finish', () => {
    pdfViewerWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: true,
      webPreferences: {
        nodeIntegration: true
      }
    })

    pdfViewerWindow.loadFile(pdfPath)

    pdfViewerWindow.on('closed', () => {
      fs.unlinkSync(pdfPath)
      pdfViewerWindow = null
    })
  })
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    icon: icon,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      nodeIntegration: true,
      sandbox: false,
      nativeWindowOpen: true //**** add this**
    }
  })

  mainWindow.maximize()
  mainWindow.setMenu(null)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  ipcMain.handle('export-backup-folder', async (event, options) => {
    try {
      const { filePaths } = await dialog.showOpenDialog(mainWindow, {
        ...options,
        properties: ['openDirectory']
      })

      if (filePaths && filePaths.length > 0) {
        return { success: true, folderPath: filePaths[0] }
      } else {
        return { success: false, error: 'No folder selected' }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.on('import-backup', async (event) => {
    try {
      const { filePaths: dbFilePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'SELECT DATABASE',
        properties: ['openFile'],
        filters: [{ name: 'Database', extensions: ['db', 'sqlite3'] }]
      })

      const { filePaths: resourcesFilePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'SELECT RESOURCES FOLDER',
        properties: ['openDirectory']
      })

      if (
        dbFilePaths &&
        dbFilePaths.length > 0 &&
        resourcesFilePaths &&
        resourcesFilePaths.length > 0
      ) {
        // Close the database connection

        dbQueries.db.close((err) => {
          if (err) {
            return console.error(err.message)
          }
          console.log('Closed the database connection.')
        })

        try {
          fsExtra.copyFileSync(dbFilePaths[0], dbQueries.dbPath)
          console.log('File copied successfully')
        } catch (error) {
          console.error(`Failed to copy file: ${error}`)
        }

        // Overwrite the resources folder
        try {
          fsExtra.copySync(resourcesFilePaths[0], path.join(__dirname, '../../resources'))
          console.log('Resources copied successfully')
        } catch (error) {
          console.error(`Failed to copy resources: ${error}`)
        }

        dialog.showMessageBox({
          title: 'Success',
          message: 'Imported successfully. Please restart your application.'
        })

        // Schedule the app to relaunch and then exit
      } else {
        dialog.showErrorBox('Both .db file and resources folder paths are required')
      }
    } catch (error) {
      dialog.showErrorBox('Error', error.message)
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    mainWindow.webContents.openDevTools()
  }
}

// app.disableHardwareAcceleration()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  expressImageServer.use(express.json())
  expressImageServer.use('/image', express.static(path.join(__dirname, '../../resources')))

  expressImageServer.use('/image/*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../../resources/default.png')) //if image not exist then send back default.png
  })

  expressImageServer.post('/uploadImage', async (req, res) => {
    const photoPath = req.body.photoPath

    console.log('photoPath from /uploadImage express server', photoPath)

    if (!photoPath) {
      return res.status(400).send('No photo path provided.')
    }

    let fileName = path.basename(photoPath)
    const extension = path.extname(fileName)
    const date = new Date().toISOString().replace(/:/g, '').replace(/-/g, '_').toUpperCase()
    const regex = /(\d{4})_(\d{2})_(\d{2})T(\d{2})(\d{2})(\d{2})/
    const formattedDate = date.replace(regex, 'IMG_$2_$3_$1_$4$5$6')
    fileName = `${formattedDate}${extension}`
    const destinationPath = path.join(__dirname, '../../resources', fileName)

    // Use fs.copyFile to copy the file to the desired location
    fs.copyFile(photoPath, destinationPath, (err) => {
      if (err) {
        return res.status(500).send(err)
      }

      console.log({ message: 'Image uploaded!', fileName: fileName })
      res.send({ message: 'Image uploaded!', fileName: fileName })
    })
  })

  expressImageServer.delete('/deleteImage/:imageName', (req, res) => {
    const imageName = req.params.imageName
    const imagePath = path.join(__dirname, '../../resources', imageName)

    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting image:', err)
        res.status(500).send({ message: 'Error deleting image' })
      } else {
        console.log('Image deleted successfully')
        res.status(200).send({ message: 'Image deleted successfully' })
      }
    })
  })

  let expressImageServerListener = expressImageServer.listen(3000, () => {
    console.log('Image server is running on http://localhost:3000')
  })

  function closeServer() {
    if (expressImageServerListener) {
      expressImageServerListener.close(() => {
        console.log('Image server has been closed')
      })
    } else {
      console.log('Image server is not running')
    }
  }

  ipcMain.handle('authenticate-user', async (event, { username, password }) => {
    try {
      const userRecord = await dbQueries.authenticateUser(username, password)

      if (userRecord) {
        // Generate a JWT on success
        mainToken = jwt.sign({ username: userRecord.username }, secretKey, { expiresIn: '72h' })
        // console.log('Signed token:', mainToken)

        // Store the JWT in the global session

        // Return the JWT and isAdmin status
        return { userRecord, mainToken }
      } else {
        // If authentication fails, return null
        return null
      }
    } catch (error) {
      // In case of an error, return null
      return error
    }
  })

  ipcMain.handle('get-user-details', async (event, token, usernameInSession, userId) => {
    // console.log('Token before verification:', token, usernameInSession, userId)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.getUserDetailsQuery(userId)
        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error getting user details:', error)
      throw error
    }
  })

  ipcMain.handle('get-user-detail', async (event, token, usernameInSession, userId) => {
    // console.log('userid', userId)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.getUserDetailQuery(userId)
        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error getting User Detail:', error)
      throw error
    }
  })

  ipcMain.handle('add-user-details', async (event, token, usernameInSession, userId, userData) => {
    // console.log('Token before verification:', token, usernameInSession, userData)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.addUserDetailsQuery(userId, userData)
        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error adding user details:', error)
      throw error
    }
  })

  ipcMain.handle(
    'update-user-details',
    async (event, token, usernameInSession, userId, userData) => {
      // console.log('Token before verification:', token, usernameInSession, userData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.updateUserDetailsQuery(userId, userData)
          return result
        }
      } catch (error) {
        console.error('Error updating user details:', error)
        throw error
      }
    }
  )
  ipcMain.handle(
    'update-user-detail',
    async (event, token, usernameInSession, userId, userData) => {
      // console.log('Token before verification:', token, usernameInSession, userData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.updateUserDetailQuery(userId, userData)
          return result
        }
      } catch (error) {
        console.error('Error updating user details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'delete-user-details',
    async (event, token, usernameInSession, userId, userDetailIds) => {
      // console.log('Token before verification:', token, usernameInSession, userId)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.deleteUserDetailsQuery(userId, userDetailIds)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error deleting user details:', error)
        throw error
      }
    }
  )

  ipcMain.handle('get-floor-details', async (event) => {
    try {
      const result = await dbQueries.getAllSpaceDetailsQuery()
      const json = JSON.parse(JSON.stringify(result))
      return json
    } catch (error) {
      console.error('Error getting floor details:', error)
      return error
    }
  })

  ipcMain.handle('add-new-space', async (event, spaceData) => {
    try {
      if (spaceData.photoPath) {
        await axios
          .post('http://localhost:3000/uploadImage', {
            photoPath: spaceData.photoPath
          })
          .then((response) => {
            console.log(response.data)
            // Modify spaceData.photoPath to just the filename
            const fileName = response.data.fileName
            spaceData.photoPath = fileName
          })
          .catch((error) => console.error('Error uploading image:', error))
      }

      try {
        const result = await dbQueries.addNewSpaceQuery(spaceData)
        return result
      } catch (error) {
        console.error('Error adding new space:', error)
        // Delete the image if the query fails
        if (spaceData.photoPath) {
          const imagePath = path.join(__dirname, '../../resources', spaceData.photoPath)
          await fs.unlink(imagePath)
        }
        throw error
      }
    } catch (error) {
      console.error('Error in add-new-space handler:', error)
      throw error
    }
  })

  ipcMain.handle('delete-space', async (event, spaceId) => {
    try {
      const result = await dbQueries.deleteSpaceQuery(spaceId)
      return result
    } catch (error) {
      console.error('Error deleting space:', error)
      return error
    }
  })

  ipcMain.handle('get-lease-table-details', async (event) => {
    try {
      const result = await dbQueries.getAllLeaseDetailsQuery()
      // console.log("LINE 260", result);
      return result
    } catch (error) {
      console.error('Error getting lease table details:', error)
      return error
    }
  })

  ipcMain.handle('add-new-lease', async (event, leaseData) => {
    try {
      const result = await dbQueries.addNewLeaseQuery(leaseData)
      return result
    } catch (error) {
      console.error('Error adding new lease:', error)
      throw error
    }
  })

  ipcMain.handle('edit-existing-lease', async (event, leaseData) => {
    try {
      const result = await dbQueries.editExistingLeaseQuery(leaseData)
      return result
    } catch (error) {
      console.error('Error editing existing lease:', error)
      throw error
    }
  })

  ipcMain.handle('delete-lease', async (event, leaseId) => {
    try {
      const result = await dbQueries.deleteLeaseQuery(leaseId)
      return result
    } catch (error) {
      return error
    }
  })

  ipcMain.handle('get-individual-lease-query', async (event, leaseId) => {
    try {
      const result = await dbQueries.getIndividualLeaseQuery(leaseId)
      return result
    } catch (error) {
      console.error('Error getting individual lease details:', error)
      throw error
    }
  })

  ipcMain.handle('add-passport-photo', async (event, passportPhoto) => {
    //console.log("passportPhoto from main", passportPhoto);
    try {
      if (passportPhoto.photoPath && passportPhoto.photoPath !== null) {
        await axios
          .post('http://localhost:3000/uploadImage', {
            photoPath: passportPhoto.photoPath
          })
          .then((response) => {
            console.log(response.data)
            // Modify passportPhoto.photoPath to just the filename
            const fileName = response.data.fileName
            passportPhoto.photoPath = fileName
          })
          .catch((error) => console.error('Error uploading image:', error))
      }

      try {
        const result = await dbQueries.updatePassportPhotoQuery(passportPhoto)
        return result
      } catch (error) {
        console.error('Error adding passport photo:', error)
        // Delete the image if the query fails
        if (passportPhoto.photoPath) {
          const imagePath = path.join(__dirname, '../../resources', passportPhoto.photoPath)
          await fs.unlink(imagePath)
        }
        throw error
      }
    } catch (error) {
      console.error('Error in add-passport-photo handler:', error)
      throw error
    }
  })

  ipcMain.handle('add-citizen-photo', async (event, citizenPhoto) => {
    //console.log("citizenPhoto from main", citizenPhoto);
    try {
      if (citizenPhoto.photoPath && citizenPhoto.photoPath !== null) {
        await axios
          .post('http://localhost:3000/uploadImage', {
            photoPath: citizenPhoto.photoPath
          })
          .then((response) => {
            console.log(response.data)
            // Modify citizenPhoto.photoPath to just the filename
            const fileName = response.data.fileName
            citizenPhoto.photoPath = fileName
          })
          .catch((error) => console.error('Error uploading image:', error))
      }

      try {
        const result = await dbQueries.updateCitizenPhotoQuery(citizenPhoto)
        return result
      } catch (error) {
        console.error('Error adding citizen photo:', error)
        // Delete the image if the query fails
        if (citizenPhoto.photoPath) {
          const imagePath = path.join(__dirname, '../../resources', citizenPhoto.photoPath)
          await fs.unlink(imagePath)
        }
        throw error
      }
    } catch (error) {
      console.error('Error in add-citizen-photo handler:', error)
      throw error
    }
  })

  ipcMain.handle('add-PAN-photo', async (event, PANPhoto) => {
    //console.log("PANPhoto from main", PANPhoto);
    try {
      if (PANPhoto.photoPath && PANPhoto.photoPath !== null) {
        await axios
          .post('http://localhost:3000/uploadImage', {
            photoPath: PANPhoto.photoPath
          })
          .then((response) => {
            console.log(response.data)
            // Modify PANPhoto.photoPath to just the filename
            const fileName = response.data.fileName
            PANPhoto.photoPath = fileName
          })
          .catch((error) => console.error('Error uploading image:', error))
      }

      try {
        const result = await dbQueries.updatePANPhotoQuery(PANPhoto)
        return result
      } catch (error) {
        console.error('Error adding PAN photo:', error)
        // Delete the image if the query fails
        if (PANPhoto.photoPath) {
          const imagePath = path.join(__dirname, '../../resources', PANPhoto.photoPath)
          await fs.unlink(imagePath)
        }
        throw error
      }
    } catch (error) {
      console.error('Error in add-PAN-photo handler:', error)
      throw error
    }
  })

  ipcMain.handle('get-income-details', async (event, userId) => {
    try {
      const result = await dbQueries.getIncomeDetailsQuery(userId)
      return result
    } catch (error) {
      console.error('Error getting income details:', error)
      throw error
    }
  })

  ipcMain.handle('get-expenditure-details', async (event, userId) => {
    try {
      const result = await dbQueries.getExpenditureDetailsQuery(userId)
      return result
    } catch (error) {
      console.error('Error getting expenditure details:', error)
      throw error
    }
  })

  ipcMain.handle('add-income-details', async (event, incomeData) => {
    try {
      const result = await dbQueries.addIncomeDetailsQuery(incomeData)
      return result
    } catch (error) {
      console.error('Error adding income details:', error)
      throw error
    }
  })

  ipcMain.handle('add-expenditure-details', async (event, expenditureData) => {
    try {
      const result = await dbQueries.addExpenditureDetailsQuery(expenditureData)
      return result
    } catch (error) {
      console.error('Error adding expenditure details:', error)
      throw error
    }
  })

  ipcMain.handle('update-income-details', async (event, incomeData) => {
    try {
      const result = await dbQueries.updateIncomeDetailsQuery(incomeData)
      return result
    } catch (error) {
      console.error('Error updating income details:', error)
      throw error
    }
  })

  ipcMain.handle('update-expenditure-details', async (event, expenditureData) => {
    try {
      const result = await dbQueries.updateExpenditureDetailsQuery(expenditureData)
      return result
    } catch (error) {
      console.error('Error updating expenditure details:', error)
      throw error
    }
  })

  ipcMain.handle('delete-income-details', async (event, incomeData) => {
    try {
      const result = await dbQueries.deleteIncomeDetailsQuery(incomeData)
      return result
    } catch (error) {
      console.error('Error deleting income details:', error)
      throw error
    }
  })

  ipcMain.handle('delete-expenditure-details', async (event, expenditureData) => {
    try {
      const result = await dbQueries.deleteExpenditureDetailsQuery(expenditureData)
      return result
    } catch (error) {
      console.error('Error deleting expenditure details:', error)
      throw error
    }
  })

  ipcMain.handle('get-building-details', async (event) => {
    try {
      const result = await dbQueries.getBuildingTableDetailsQuery()
      return result
    } catch (error) {
      console.error('Error getting building details:', error)
      throw error
    }
  })

  ipcMain.handle('get-building-image-details', async (event) => {
    try {
      const result = await dbQueries.getBuildingImageDetailsQuery()
      return result
    } catch (error) {
      console.error('Error getting building image details:', error)
      throw error
    }
  })

  ipcMain.handle('add-building-image-details', async (event, buildingImageData) => {
    console.log('line 566 from index', buildingImageData)
    try {
      if (buildingImageData.imagePath && buildingImageData.imagePath !== null) {
        const response = await axios.post('http://localhost:3000/uploadImage', {
          photoPath: buildingImageData.imagePath
        })

        console.log(response.data)
        // Modify buildingImageData.photoPath to just the filename
        const fileName = response.data.fileName
        buildingImageData.imagePath = fileName
        console.log('line 567 from index', buildingImageData.imagePath)
      }

      try {
        const result = await dbQueries.addBuildingImageTableDetailsQuery(buildingImageData)
        return result
      } catch (error) {
        console.error('Error adding building image data:', error)
        // Delete the image if the query fails
        if (buildingImageData.imagePath) {
          const deleteImagePath = path.join(
            __dirname,
            '../../resources',
            buildingImageData.imagePath
          )
          fs.unlink(deleteImagePath, (err) => {
            if (err) {
              console.error('Error deleting image:', err)
            } else {
              console.log('Successfully deleted image')
            }
          })
        }
      }
    } catch (error) {
      console.error('Error in add-building-image-details:', error)
    }
  })

  ipcMain.handle('update-building-details', async (event, buildingData) => {
    try {
      const result = await dbQueries.updateBuildingTableDetailsQuery(buildingData)
      return result
    } catch (error) {
      console.error('Error updating building details:', error)
      throw error
    }
  })

  ipcMain.handle('delete-all-building-details', async (event) => {
    try {
      const result = await dbQueries.deleteAllBuildingTableDetailsQuery()
      return result
    } catch (error) {
      console.error('Error deleting all building image details:', error)
      throw error
    }
  })

  ipcMain.handle('update-building-image-details', async (event, buildingImageData) => {
    console.log('buildingImageData', buildingImageData)
    try {
      if (buildingImageData.imagePath && buildingImageData.imagePath !== null) {
        await axios
          .post('http://localhost:3000/uploadImage', {
            photoPath: buildingImageData.imagePath
          })
          .then((response) => {
            console.log(response.data)
            // Modify buildingImageData.imagePath to just the filename
            const fileName = response.data.fileName
            buildingImageData.imagePath = fileName
          })
          .catch((error) => console.error('Error uploading image:', error))
      }

      try {
        const result = await dbQueries.updateBuildingImageTableDetailsQuery(buildingImageData)
        if (result.oldImagePath) {
          const deleteImagePath = path.join(__dirname, '../../resources', result.oldImagePath)
          fs.unlink(deleteImagePath, (err) => {
            if (err) {
              console.error('Error deleting old image:', err)
            } else {
              console.log('Successfully deleted old image')
            }
          })
        }
        return result
      } catch (error) {
        console.error('Error updating building image data:', error)
        // Delete the image if the query fails

        if (buildingImageData.imagePath) {
          const deleteImagePath = path.join(
            __dirname,
            '../../resources',
            buildingImageData.imagePath
          )
          fs.unlink(deleteImagePath, (err) => {
            if (err) {
              console.error('Error deleting image:', err)
            } else {
              console.log('Successfully deleted image')
            }
          })
        }
      }
    } catch (error) {
      console.error('Error in update-building-image-details:', error)
    }
  })

  ipcMain.handle('delete-building-image-details', async (event, buildingImageData) => {
    try {
      const result = await dbQueries.deleteBuildingImageTableDetailsQuery(buildingImageData)
      return result
    } catch (error) {
      console.error('Error deleting building image details:', error)
      throw error
    }
  })

  ipcMain.handle('get-lease-details-username', async (event, token, usernameInSession) => {
    //verify the token first
    // console.log('Token before verification:', token)
    // console.log('Username in session:', usernameInSession)

    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.getLeaseDetailsUsernameQuery(usernameInSession)

        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error getting lease details username:', error)
      throw error
    }
  })

  ipcMain.handle(
    'get-tax-manager-image-details',
    async (event, token, usernameInSession, leaseId) => {
      // console.log('Token before verification:', token, usernameInSession, leaseId)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.getTaxManagerSpaceImageDetailsQuery(usernameInSession)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error getting tax manager image details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'add-tax-manager-image-details',
    async (event, token, usernameInSession, taxManagerImageData) => {
      console.log('Token before verification:', token, usernameInSession, taxManagerImageData)
      // console.log('taxManagerImageData from main', taxManagerImageData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          if (taxManagerImageData.imagePath && taxManagerImageData.imagePath !== null) {
            const response = await axios.post('http://localhost:3000/uploadImage', {
              photoPath: taxManagerImageData.imagePath
            })

            //console.log(response.data)
            // Modify taxManagerImageData.photoPath to just the filename
            const fileName = response.data.fileName
            taxManagerImageData.imagePath = fileName
            // console.log('line 567 from index', taxManagerImageData.imagePath)
          }

          try {
            const result = await dbQueries.addTaxManagerSpaceImageDetailsQuery(
              usernameInSession,
              taxManagerImageData
            )
            return result
          } catch (error) {
            console.error('Error adding tax manager image data:', error)
            // Delete the image if the query fails
            if (taxManagerImageData.imagePath) {
              const deleteImagePath = path.join(
                __dirname,
                '../../resources',
                taxManagerImageData.imagePath
              )
              fs.unlink(deleteImagePath, (err) => {
                if (err) {
                  console.error('Error deleting image:', err)
                } else {
                  console.log('Successfully deleted image')
                }
              })
            }
          }
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error in add-tax-manager-image-details:', error)
      }
    }
  )

  ipcMain.handle(
    'update-tax-manager-image-details',
    async (event, token, usernameInSession, taxManagerImageData) => {
      console.log('Token before verification:', token, usernameInSession, taxManagerImageData)
      // console.log('taxManagerImageData from main', taxManagerImageData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          if (taxManagerImageData.imagePath && taxManagerImageData.imagePath !== null) {
            await axios
              .post('http://localhost:3000/uploadImage', {
                photoPath: taxManagerImageData.imagePath
              })
              .then((response) => {
                // console.log(response.data)
                // Modify taxManagerImageData.imagePath to just the filename
                const fileName = response.data.fileName
                taxManagerImageData.imagePath = fileName
              })
              .catch((error) => console.error('Error uploading image:', error))
          }

          try {
            const result = await dbQueries.updateTaxManagerSpaceImageDetailsQuery(
              usernameInSession,
              taxManagerImageData
            )
            if (result.oldImagePath) {
              const deleteImagePath = path.join(__dirname, '../../resources', result.oldImagePath)
              fs.unlink(deleteImagePath, (err) => {
                if (err) {
                  console.error('Error deleting old image:', err)
                } else {
                  console.log('Successfully deleted old image')
                }
              })
            }
            return result
          } catch (error) {
            console.error('Error updating tax manager image data:', error)
            // Delete the image if the query fails

            if (taxManagerImageData.imagePath) {
              const deleteImagePath = path.join(
                __dirname,
                '../../resources',
                taxManagerImageData.imagePath
              )
              fs.unlink(deleteImagePath, (err) => {
                if (err) {
                  console.error('Error deleting image:', err)
                } else {
                  console.log('Successfully deleted image')
                }
              })
            }
          }
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error in update-tax-manager-image-details:', error)
      }
    }
  )

  ipcMain.handle(
    'delete-tax-manager-image-details',
    async (event, token, usernameInSession, spaceImageId) => {
      // console.log('Token before verification:', token, usernameInSession, spaceImageId)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const dbResult = await dbQueries.deleteTaxManagerSpaceImageDetailsQuery(
            usernameInSession,
            spaceImageId
          )

          // console.log('oldImagePath from delete-tax-manager-image-details', dbResult.oldImagePath)

          // Call the delete image API
          const response = await axios.delete(
            `http://localhost:3000/deleteImage/${dbResult.oldImagePath}`
          )

          if (response.status !== 200) {
            throw new Error(`Error deleting image: ${response.statusText}`)
          }

          return dbResult.oldImagePath
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error deleting tax manager image details:', error)
        throw error
      }
    }
  )

  ipcMain.handle('get-petty-details', async (event, token, usernameInSession, userId) => {
    // console.log('Token before verification:', token, usernameInSession, userId)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.getPettyDetailsQuery(userId)
        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error getting petty details:', error)
      throw error
    }
  })

  ipcMain.handle('get-cash-account-details', async (event, token, usernameInSession, userId) => {
    // console.log('Token before verification:', token, usernameInSession, userId)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.getCashAccountDetailsQuery(userId)
        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error getting cash account details:', error)
      throw error
    }
  })

  ipcMain.handle(
    'add-petty-details',
    async (event, token, usernameInSession, userId, pettyData) => {
      // console.log('Token before verification:', token, usernameInSession, pettyData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.addPettyDetailsQuery(userId, pettyData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error adding petty details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'add-cash-account-details',
    async (event, token, usernameInSession, userId, cashAccountData) => {
      // console.log('Token before verification:', token, usernameInSession, cashAccountData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.addCashAccountDetailsQuery(userId, cashAccountData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error adding cash account details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'update-petty-details',
    async (event, token, usernameInSession, userId, pettyData) => {
      // console.log('Token before verification:', token, usernameInSession, pettyData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.updatePettyDetailsQuery(userId, pettyData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error updating petty details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'update-cash-account-details',
    async (event, token, usernameInSession, userId, cashAccountData) => {
      // console.log('Token before verification:', token, usernameInSession, cashAccountData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.updateCashAccountDetailsQuery(userId, cashAccountData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error updating cash account details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'delete-petty-details',
    async (event, token, usernameInSession, userId, pettyIds) => {
      // console.log('Token before verification:', token, usernameInSession, userId, pettyIds)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.deletePettyDetailsQuery(userId, pettyIds)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error deleting petty details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'delete-cash-account-details',
    async (event, token, usernameInSession, userId, cashAccountIds) => {
      // console.log('Token before verification:', token, usernameInSession, userId, cashAccountIds)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.deleteCashAccountDetailsQuery(userId, cashAccountIds)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error deleting cash account details:', error)
        throw error
      }
    }
  )

  ipcMain.handle('get-payable-details', async (event, token, usernameInSession, userId) => {
    // console.log('Token before verification:', token, usernameInSession, userId)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.getPayableDetailsQuery(userId)
        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error getting payable details:', error)
      throw error
    }
  })

  ipcMain.handle('get-receivable-details', async (event, token, usernameInSession, userId) => {
    // console.log('Token before verification:', token, usernameInSession, userId)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.getReceivableDetailsQuery(userId)
        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error getting receivable details:', error)
      throw error
    }
  })

  ipcMain.handle(
    'add-payable-details',
    async (event, token, usernameInSession, userId, payableData) => {
      // console.log('Token before verification:', token, usernameInSession, userId, payableData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.addPayableDetailsQuery(userId, payableData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error adding payable details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'add-receivable-details',
    async (event, token, usernameInSession, userId, receivableData) => {
      // console.log('Token before verification:', token, usernameInSession, userId, receivableData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.addReceivableDetailsQuery(userId, receivableData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error adding receivable details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'update-payable-details',
    async (event, token, usernameInSession, userId, payableData) => {
      // console.log('Token before verification:', token, usernameInSession, userId, payableData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.updatePayableDetailsQuery(userId, payableData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error updating payable details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'update-receivable-details',
    async (event, token, usernameInSession, userId, receivableData) => {
      // console.log('Token before verification:', token, usernameInSession, userId, receivableData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.updateReceivableDetailsQuery(userId, receivableData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error updating receivable details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'delete-payable-details',
    async (event, token, usernameInSession, userId, payableIds) => {
      // console.log('Token before verification:', token, usernameInSession, userId, payableIds)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.deletePayableDetailsQuery(userId, payableIds)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error deleting payable details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'delete-receivable-details',
    async (event, token, usernameInSession, userId, receivableIds) => {
      // console.log('Token before verification:', token, usernameInSession, userId, receivableIds)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.deleteReceivableDetailsQuery(userId, receivableIds)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error deleting receivable details:', error)
        throw error
      }
    }
  )

  ipcMain.handle('get-advance-details', async (event, token, usernameInSession, userId) => {
    // console.log('Token before verification:', token, usernameInSession, userId)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.getAdvanceDetailsQuery(userId)
        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error getting advance details:', error)
      throw error
    }
  })

  ipcMain.handle(
    'add-advance-details',
    async (event, token, usernameInSession, userId, advanceData) => {
      // console.log('Token before verification:', token, usernameInSession, userId, advanceData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.addAdvanceDetailsQuery(userId, advanceData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error adding advance details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'update-advance-details',
    async (event, token, usernameInSession, userId, advanceData) => {
      // console.log('Token before verification:', token, usernameInSession, userId, advanceData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.updateAdvanceDetailsQuery(userId, advanceData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error updating advance details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'delete-advance-details',
    async (event, token, usernameInSession, userId, advanceIds) => {
      // console.log('Token before verification:', token, usernameInSession, userId, advanceIds)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.deleteAdvanceDetailsQuery(userId, advanceIds)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error deleting advance details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'get-salary-incentives-details',
    async (event, token, usernameInSession, userId) => {
      // console.log('Token before verification:', token, usernameInSession, userId)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.getSalaryIncentivesDetailsQuery(userId)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error getting salary incentives details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'update-salary-incentives-details',
    async (event, token, usernameInSession, userId, salaryIncentivesData) => {
      // console.log('Token before verification:', token, usernameInSession, userId, salaryIncentivesData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.updateSalaryIncentivesDetailsQuery(
            userId,
            salaryIncentivesData
          )
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error updating salary incentives details:', error)
        throw error
      }
    }
  )

  ipcMain.handle('get-all-facility-details', async (event, token, usernameInSession) => {
    // console.log('Token before verification:', token, usernameInSession)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.getAllFacilityDetailsQuery()
        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error getting facility details:', error)
      throw error
    }
  })

  ipcMain.handle('add-facility-details', async (event, token, usernameInSession, facilityData) => {
    // console.log('Token before verification:', token, usernameInSession, facilityData)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const result = await dbQueries.addFacilityDetailsQuery(facilityData)
        return result
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error adding facility details:', error)
      throw error
    }
  })

  ipcMain.handle(
    'update-facility-details',
    async (event, token, usernameInSession, facilityData) => {
      // console.log('Token before verification:', token, usernameInSession, facilityData)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.updateFacilityDetailsQuery(facilityData)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error updating facility details:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'delete-facility-details',
    async (event, token, usernameInSession, facilityIds) => {
      // console.log('Token before verification:', token, usernameInSession, facilityId)
      try {
        const decoded = jwt.verify(token, secretKey)
        if (decoded.username === usernameInSession) {
          const result = await dbQueries.deleteFacilityDetailsQuery(facilityIds)
          return result
        } else {
          throw new Error('Token mismatch')
        }
      } catch (error) {
        console.error('Error deleting facility details:', error)
        throw error
      }
    }
  )

  ipcMain.on('print-document', (event, leaseDetails) => {
    // console.log("hlo from ipcMain:", leaseDetails);
    if (!pdfViewerWindow) {
      pdfProcessor(leaseDetails)
    }
  })

  ipcMain.on('open-scanner', (event) => {
    shell.openPath('C:/Windows/System32/WFS.exe')
    const documentsPath = app.getPath('documents')
    const scannedDocumentsPath = path.join(documentsPath, 'Scanned Documents')
    shell.openPath(scannedDocumentsPath)
  })

  ipcMain.handle('export-backup', async (event, token, usernameInSession, backupFolderPath) => {
    console.log('backupFilePath from main', backupFolderPath)
    try {
      const decoded = jwt.verify(token, secretKey)
      if (decoded.username === usernameInSession) {
        const now = new Date()
        const timestamp = now.toISOString().replace(/[:.]/g, '-')
        const backupFilePath = path.join(
          backupFolderPath,
          `mallManager_DATABASE_BACKUP${timestamp}.db`
        )

        // Copy the database file
        await fsPromise.copyFile(dbQueries.dbPath, backupFilePath)

        // Copy the resources directory
        const resourcesPath = path.join(__dirname, '../../resources')
        const resourcesBackupPath = path.join(
          backupFolderPath,
          `mallManager_IMAGES_BACKUP-${timestamp}`
        )
        await fsExtra.copy(resourcesPath, resourcesBackupPath)

        // Add a delay
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Open the directory containing the backup file
        await shell.openPath(backupFolderPath)

        return {
          status: 'success',
          message: 'Backup exported successfully'
        }
      } else {
        throw new Error('Token mismatch')
      }
    } catch (error) {
      console.error('Error exporting backup:', error)
      throw error
    }
  })

  ipcMain.handle('logout', (event, token, userInSession) => {
    if (mainToken === token) {
      mainToken = null
    } else {
      throw new Error('Token mismatch')
    }
    return mainToken
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
