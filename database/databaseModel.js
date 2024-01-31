const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const bcrypt = require('bcrypt')
const { is } = require('@electron-toolkit/utils')
const log = require('electron-log')
const { app } = require('electron')
const fs = require('fs')

if (!fs.existsSync(path.join(app.getPath('userData'), 'database'))) {
  fs.mkdirSync(path.join(app.getPath('userData'), 'database'))
}

const dbPath = is.dev
  ? path.join(app.getAppPath(), 'database', 'mallManager.sqlite')
  : path.join(app.getPath('userData'), 'database', 'mallManager.sqlite')
console.log('dbPath', dbPath)

// log.info('dbPath', dbPath)

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message)
  } else {
    console.log('Connected to the mallManager database.')

    db.run('PRAGMA foreign_keys = ON;', (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Foreign key constraints enabled.')
      }
    })

    createUserTable()
    createSpaceDetailsTable()
    createLeaseDetailsTable()
    createDocumentPhotoDetailsTable()
    createIncomeDetailsTable()
    createExpenditureDetailsTable()
    createBuildingDetailsTables()
    createTaxManagerSpaceImageDetailsTable()
    createPettyDetailsTable()
    createCashAccountDetailsTable()
    createPayableDetailsTable()
    createReceivableDetailsTable()
    createAdvanceDetailsTable()
    createFacilityDetailsTable()
  }
})

// Create user table
function createUserTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS user_details (
    userid INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    firstName TEXT,
    lastName TEXT,
    contact INTEGER CHECK (typeof(contact) = 'integer'),
    secondaryContact INTEGER CHECK (typeof(secondaryContact) = 'integer'),
    base_salary TEXT,
    bonus TEXT,
    incentives TEXT,
    isAdmin INTEGER DEFAULT 0,
    isSuperUser INTEGER DEFAULT 0
  )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('User table created.')

        db.get(`SELECT COUNT(*) AS count FROM user_details WHERE isSuperUser = 1`, (err, row) => {
          if (err) {
            console.error(err.message)
          } else {
            if (row.count === 0) {
              const username = 'superuser'
              const password = 'superuser'
              bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                  console.error(err.message)
                } else {
                  db.run(
                    `INSERT INTO user_details (username, password, isSuperUser)
                    VALUES (?, ?, 1)`,
                    [username, hashedPassword],
                    (err) => {
                      if (err) {
                        console.error(err.message)
                      } else {
                        console.log('SuperUser user created.')
                      }
                    }
                  )
                }
              })
            }
          }
        })
      }
    }
  )
}

// Create superuser user if no positive values for isSuperUser exist
// function createSuperUser() {
//   db.get(`SELECT COUNT(*) AS count FROM user_details WHERE isSuperUser = 1`, (err, row) => {
//     if (err) {
//       console.error(err.message)
//     } else {
//       if (row.count === 0) {
//         const username = 'superuser'
//         const password = 'superuser'
//         bcrypt.hash(password, 10, (err, hashedPassword) => {
//           if (err) {
//             console.error(err.message)
//           } else {
//             db.run(
//               `INSERT INTO user_details (username, password, isSuperUser)
//               VALUES (?, ?, 1)`,
//               [username, hashedPassword],
//               (err) => {
//                 if (err) {
//                   console.error(err.message)
//                 } else {
//                   console.log('SuperUser user created.')
//                 }
//               }
//             )
//           }
//         })
//       }
//     }
//   })
// }

// Create space details/ floor details table
function createSpaceDetailsTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS space_details (
    spaceId INTEGER PRIMARY KEY AUTOINCREMENT,
    spaceNumber INTEGER,
    floorNumber INTEGER,
    rent INTEGER,
    vacancy BOOLEAN,
    photoPath TEXT,
    addedbyuserid INTEGER,
    UNIQUE (floorNumber, spaceNumber)
  )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Space details table initialized...')
      }
    }
  )
}

//create lease details table
function createLeaseDetailsTable() {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS lease_details (
      leaseId INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      userName Text,
      contact TEXT,
      emergencyContact TEXT,
      dateOfEffect TEXT,
      dateOfExpiry TEXT,
      spaceRenting INTEGER,
      floorNumber INTEGER,
      PANNumber TEXT,
      citizenshipNumber TEXT,
      UNIQUE (spaceRenting, floorNumber)
    )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Lease details table initialized...')
      }
    }
  )
}

function createDocumentPhotoDetailsTable() {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS document_photo_details (
      leaseId INTEGER,
      PANPhoto TEXT,
      citizenPhoto TEXT,
      passportSizePhoto TEXT,
      FOREIGN KEY (leaseId) REFERENCES lease_details (leaseId) ON DELETE CASCADE
    )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Document photo details table initialized...')
      }
    }
  )
}

function createIncomeDetailsTable() {
  // Store income_amount as TEXT and manually convert it to number
  db.run(
    `CREATE TABLE IF NOT EXISTS income_details (
    incomeId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    income_date TEXT,                                     
    income_source TEXT,
    income_amount TEXT,
    FOREIGN KEY (userId) REFERENCES user_details(userId)
  )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Income details table initialized...')
      }
    }
  )
}

function createExpenditureDetailsTable() {
  // Store expenditure_amount as TEXT and manually convert it to number
  db.run(
    `CREATE TABLE IF NOT EXISTS expenditure_details (
    expenditureId INTEGER PRIMARY KEY AUTOINCREMENT,
    expenditure_date TEXT,                                     
    userId INTEGER,
    expenditure_source TEXT,
    expenditure_amount TEXT,                                     
    FOREIGN KEY (userId) REFERENCES user_details(userId)
  )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Expenditure details table initialized...')
      }
    }
  )
}

function createBuildingDetailsTables() {
  db.run(
    `CREATE TABLE IF NOT EXISTS building_details (
      totalBlocks INT,
      parkingSpace TEXT,
      distanceFromRoad TEXT,
      servantRoom BOOLEAN,
      generator TEXT,
      waterDetails TEXT,
      gateDetails TEXT,
      price TEXT,
      ownerName TEXT,
      ownerCompany TEXT,
      ownerAddress TEXT,
      ownerPrimaryContact TEXT,
      ownerSecondaryContact TEXT,
      leaseStatus TEXT
    )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Building details table initialized...')
        db.get(`SELECT COUNT(*) as count FROM building_details`, (err, row) => {
          if (err) {
            console.error(err.message)
          } else if (row.count === 0) {
            db.run(`INSERT INTO building_details DEFAULT VALUES`, (err) => {
              if (err) {
                console.error(err.message)
              } else {
                console.log('Building details row initialized with NULL values...')
              }
            })
          }
        })
      }
    }
  )

  db.run(
    `CREATE TABLE IF NOT EXISTS building_image_details (
    buildingImageId INTEGER PRIMARY KEY AUTOINCREMENT,
    imageIndex TEXT,
    imagePath TEXT DEFAULT 'default.png'
  )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Building image details table initialized...')
      }
    }
  )
}

function createTaxManagerSpaceImageDetailsTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS taxmanager_space_image_details (
      spaceImageId INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      imagePath TEXT DEFAULT 'default.png'
    )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Tax Manager Space Image Details table initialized...')
      }
    }
  )
}

function createPettyDetailsTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS petty_details (
    pettyId INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    description TEXT,
    amount TEXT,
    userid INTEGER,
    FOREIGN KEY(userid) REFERENCES user_details(userid)
  )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Petty table created.')
      }
    }
  )
}

function createCashAccountDetailsTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS cash_account_details (
    cashAccountId INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    description TEXT,
    amount TEXT,
    userid INTEGER,
    FOREIGN KEY(userid) REFERENCES user_details(userid)
  )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Cash Account table created.')
      }
    }
  )
}

function createPayableDetailsTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS payable_details (
    payableId INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    description TEXT,
    amount TEXT,
    payable_to TEXT,
    userid INTEGER,
    FOREIGN KEY(userid) REFERENCES user_details(userid)
  )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Payable details table created.')
      }
    }
  )
}

function createReceivableDetailsTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS receivable_details (
    receivableId INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    description TEXT,
    amount TEXT,
    receivable_from TEXT,
    userid INTEGER,
    FOREIGN KEY(userid) REFERENCES user_details(userid)
  )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Receivable details table created.')
      }
    }
  )
}

function createAdvanceDetailsTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS advance_details (
      advanceId INTEGER PRIMARY KEY AUTOINCREMENT,
      amount TEXT,
      recipient TEXT,
      dateIssued TEXT,
      dateSettled TEXT,
      status BOOLEAN,
      userId INTEGER,
      FOREIGN KEY(userid) REFERENCES user_details(userid)
    )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Advance details table created.')
      }
    }
  )
}

function createFacilityDetailsTable() {
  db.run(
    `CREATE TABLE IF NOT EXISTS facility_details (
      facilityId INTEGER PRIMARY KEY AUTOINCREMENT,
      facilityType TEXT DEFAULT 'n/a',
      providerName TEXT DEFAULT 'n/a',
      contractStart TEXT DEFAULT 'n/a',
      contractEnd TEXT DEFAULT 'n/a',
      contractCost TEXT DEFAULT '0',
      services TEXT DEFAULT 'n/a',
      frequency TEXT DEFAULT 'n/a',
      contactInformation TEXT DEFAULT 'n/a',
      estimatedCharge TEXT DEFAULT '0',
      status TEXT DEFAULT 'unfixed',
      remarks TEXT DEFAULT 'n/a'
    )`,
    (err) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log('Facility table created.')
      }
    }
  )
}

function getAllFacilityDetailsQuery() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM facility_details', (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getAllSpaceDetailsQuery() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM space_details', (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getAllLeaseDetailsQuery() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM lease_details', (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function addNewLeaseQuery(leaseData) {
  return new Promise((resolve, reject) => {
    if (!leaseData || Object.values(leaseData).some((v) => v == null)) {
      //checking if has null property
      reject(new Error('Lease data is incomplete'))
      return
    }

    const query = `
      INSERT INTO lease_details (
        firstName, lastName, contact, emergencyContact, dateOfEffect, dateOfExpiry, 
        spaceRenting, floorNumber, PANNumber, citizenshipNumber, userName
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      leaseData.firstName,
      leaseData.lastName,
      leaseData.contact,
      leaseData.emergencyContact,
      leaseData.dateOfEffect,
      leaseData.dateOfExpiry,
      leaseData.spaceRenting,
      leaseData.floorNumber,
      leaseData.PANNumber,
      leaseData.citizenshipNumber,
      leaseData.userName
    ]

    db.run(query, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({ id: this.lastID })
      }
    })
  })
}

function editExistingLeaseQuery(leaseData) {
  return new Promise((resolve, reject) => {
    if (!leaseData || Object.values(leaseData).some((v) => v == null)) {
      //checking if has null property
      reject(new Error('Lease data is incomplete'))
      return
    }

    // console.log('226 from dbmodel.js', leaseData)

    const query = `
      UPDATE lease_details SET
        firstName = ?, lastName = ?, contact = ?, emergencyContact = ?, dateOfEffect = ?, dateOfExpiry = ?,
        spaceRenting = ?, floorNumber = ?, PANNumber = ?, citizenshipNumber = ?, userName = ?
      WHERE leaseId = ?
    `
    const params = [
      leaseData.firstName,
      leaseData.lastName,
      leaseData.contact,
      leaseData.emergencyContact,
      leaseData.dateOfEffect,
      leaseData.dateOfExpiry,
      leaseData.spaceRenting,
      leaseData.floorNumber,
      leaseData.PANNumber,
      leaseData.citizenshipNumber,
      leaseData.userName,
      leaseData.leaseId
    ]

    db.run(query, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({ id: this.lastID })
      }
    })
  })
}

function deleteLeaseQuery(leaseId) {
  return new Promise((resolve, reject) => {
    if (!leaseId) {
      reject(new Error('Lease ID is required'))
      return
    }

    // Delete the lease
    db.run(`DELETE FROM lease_details WHERE leaseId = ?`, [leaseId], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.changes)
      }
    })
  })
}

function getLeaseDetailsUsernameQuery(username) {
  return new Promise((resolve, reject) => {
    if (!username) {
      reject('Username is required')
      return
    }

    // Check if the lease exists in the database
    const query = `SELECT * FROM lease_details WHERE userName = ?`

    db.all(query, [username], (err, rows) => {
      if (err) {
        reject(new Error(err.message))
      } else if (!rows || rows.length === 0) {
        reject(new Error('No lease found for the given username')) // Reject instead of resolve
      } else {
        // console.log('rows from dbmodel.js', rows, rows.length)
        resolve({ details: rows, count: rows.length })
      }
    })
  })
}

function getIndividualLeaseQuery(leaseId) {
  return new Promise((resolve, reject) => {
    if (!leaseId) {
      reject('Lease ID is required')
      return
    }

    // Check if the lease exists in the database
    const query = `
      SELECT * 
      FROM lease_details 
      LEFT JOIN document_photo_details 
      ON lease_details.leaseId = document_photo_details.leaseId 
      WHERE lease_details.leaseId = ?
    `

    db.get(query, [leaseId], (err, row) => {
      if (err) {
        reject(new Error(err.message))
      } else if (!row) {
        reject(new Error('No lease found for the given ID')) // Reject instead of resolve
      } else {
        row.leaseId = row.leaseId ? row.leaseId : Number(leaseId)
        resolve(row)
      }
    })
  })
}

function updatePassportPhotoQuery(photoData) {
  return new Promise((resolve, reject) => {
    if (!photoData || photoData.leaseId == null) {
      reject(new Error('Passport photo data and leaseId are required'))
      return
    }

    let selectQuery = 'SELECT * FROM document_photo_details WHERE leaseId = ?'
    let selectParams = [photoData.leaseId]

    db.get(selectQuery, selectParams, (err, row) => {
      if (err) {
        reject(err)
      } else {
        let query
        let params

        if (row) {
          // If row exists, update it
          query = 'UPDATE document_photo_details SET passportSizePhoto = ? WHERE leaseId = ?'
          params = [photoData.photoPath, photoData.leaseId]
        } else {
          // If row does not exist, insert it
          query = 'INSERT INTO document_photo_details (leaseId, passportSizePhoto) VALUES (?, ?)'
          params = [photoData.leaseId, photoData.photoPath]
        }

        db.run(query, params, function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(this.changes)
          }
        })
      }
    })
  })
}

function updatePANPhotoQuery(photoData) {
  return new Promise((resolve, reject) => {
    if (!photoData || photoData.leaseId == null) {
      reject(new Error('PAN photo data and leaseId are required'))
      return
    }

    let selectQuery = 'SELECT * FROM document_photo_details WHERE leaseId = ?'
    let selectParams = [photoData.leaseId]

    db.get(selectQuery, selectParams, (err, row) => {
      if (err) {
        reject(err)
      } else {
        let query
        let params

        if (row) {
          // If row exists, update it
          query = 'UPDATE document_photo_details SET PANPhoto = ? WHERE leaseId = ?'
          params = [photoData.photoPath, photoData.leaseId]
        } else {
          // If row does not exist, insert it
          query = 'INSERT INTO document_photo_details (leaseId, PANPhoto) VALUES (?, ?)'
          params = [photoData.leaseId, photoData.photoPath]
        }

        db.run(query, params, function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(this.changes)
          }
        })
      }
    })
  })
}

function updateCitizenPhotoQuery(citizenPhoto) {
  console.log(citizenPhoto)
  return new Promise((resolve, reject) => {
    if (!citizenPhoto || citizenPhoto.leaseId == null) {
      reject(new Error('CIT photo data and leaseId are required'))
      return
    }

    let selectQuery = 'SELECT * FROM document_photo_details WHERE leaseId = ?'
    let selectParams = [citizenPhoto.leaseId]

    db.get(selectQuery, selectParams, (err, row) => {
      if (err) {
        reject(err)
      } else {
        let query
        let params

        if (row) {
          // If row exists, update it
          query = 'UPDATE document_photo_details SET citizenPhoto = ? WHERE leaseId = ?'
          params = [citizenPhoto.photoPath, citizenPhoto.leaseId]
        } else {
          // If row does not exist, insert it
          query = 'INSERT INTO document_photo_details (leaseId, citizenPhoto) VALUES (?, ?)'
          params = [citizenPhoto.leaseId, citizenPhoto.photoPath]
        }

        db.run(query, params, function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(this.changes)
          }
        })
      }
    })
  })
}

function addNewSpaceQuery(spaceData) {
  return new Promise((resolve, reject) => {
    if (!spaceData) {
      reject(new Error('Space data is required'))
      return
    }

    if (!spaceData.userid) {
      reject(new Error('User ID is required'))
      return
    }

    // Check if the user exists in the database
    db.get(`SELECT * FROM user_details WHERE userid = ?`, [spaceData.userid], (err, row) => {
      if (err) {
        reject(err)
      } else if (!row) {
        reject(new Error('Invalid user ID'))
      } else {
        // If the user exists, insert the new space
        db.run(
          `INSERT INTO space_details (spaceNumber, floorNumber, rent, vacancy, photoPath, addedbyuserid) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            spaceData.spaceNumber,
            spaceData.floorNumber,
            spaceData.rent,
            spaceData.vacancy,
            spaceData.photoPath,
            spaceData.userid
          ],
          function (err) {
            if (err) {
              reject(err)
            } else {
              resolve(this.lastID)
            }
          }
        )
      }
    })
  })
}

function deleteSpaceQuery(spaceId) {
  return new Promise((resolve, reject) => {
    if (!spaceId) {
      reject(new Error('Space ID is required'))
      return
    }

    // Check if the space exists in the database
    db.get(`SELECT * FROM space_details WHERE spaceId = ?`, [spaceId], (err, row) => {
      if (err) {
        reject(err)
      } else if (!row) {
        reject(new Error('Invalid space ID'))
      } else {
        // If the space exists, delete the space
        db.run(`DELETE FROM space_details WHERE spaceId = ?`, [spaceId], function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(this.changes)
          }
        })
      }
    })
  })
}

function getIncomeDetailsQuery(userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM income_details WHERE userId = ?`, [userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getExpenditureDetailsQuery(userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM expenditure_details WHERE userId = ?`, [userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function addIncomeDetailsQuery(incomeData) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO income_details (userId, income_source, income_amount, income_date) VALUES (?, ?, ?, ?)`,
      [
        incomeData.userId,
        incomeData.income_source,
        incomeData.income_amount,
        incomeData.income_date
      ],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.lastID)
        }
      }
    )
  })
}

function addExpenditureDetailsQuery(expenditureData) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO expenditure_details (userId, expenditure_source, expenditure_amount, expenditure_date) VALUES (?, ?, ?, ?)`,
      [
        expenditureData.userId,
        expenditureData.expenditure_source,
        expenditureData.expenditure_amount,
        expenditureData.expenditure_date
      ],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.lastID)
        }
      }
    )
  })
}

function updateIncomeDetailsQuery(incomeData) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE income_details SET income_source = ?, income_amount = ?, income_date = ? WHERE userId = ? AND incomeId = ?`,
      [
        incomeData.income_source,
        incomeData.income_amount,
        incomeData.income_date,
        incomeData.userId,
        incomeData.incomeId
      ],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes)
        }
      }
    )
  })
}

function updateExpenditureDetailsQuery(expenditureData) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE expenditure_details SET expenditure_source = ?, expenditure_amount = ?, expenditure_date = ? WHERE userId = ? AND expenditureId = ?`,
      [
        expenditureData.expenditure_source,
        expenditureData.expenditure_amount,
        expenditureData.expenditure_date,
        expenditureData.userId,
        expenditureData.expenditureId
      ],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes)
        }
      }
    )
  })
}

function deleteIncomeDetailsQuery(incomeData) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM income_details WHERE userId = ? AND incomeId = ?`,
      [incomeData.userId, incomeData.incomeId],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes)
        }
      }
    )
  })
}

function deleteExpenditureDetailsQuery(expenditureData) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM expenditure_details WHERE userId = ? AND expenditureId = ?`,
      [expenditureData.userId, expenditureData.expenditureId],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes)
        }
      }
    )
  })
}

function getBuildingTableDetailsQuery() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM building_details'
    db.get(sql, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

function getBuildingImageDetailsQuery() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM building_image_details'
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        const countSql = 'SELECT COUNT(*) as imageCount FROM building_image_details'
        db.get(countSql, (countErr, countRow) => {
          if (countErr) {
            reject(countErr)
          } else {
            resolve({
              imageDetails: rows,
              imageCount: countRow.imageCount
            })
          }
        })
      }
    })
  })
}

function addBuildingImageTableDetailsQuery(buildingImageData) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO building_image_details (imageIndex, imagePath) VALUES (?, ?)'
    const params = [buildingImageData.imageIndex, buildingImageData.imagePath]
    db.run(sql, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.lastID)
      }
    })
  })
}

function updateBuildingTableDetailsQuery(buildingData) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE building_details SET totalBlocks = ?, parkingSpace = ?, distanceFromRoad = ?, servantRoom = ?, generator = ?, waterDetails = ?, gateDetails = ?, price = ?, ownerName = ?, ownerCompany = ?, ownerAddress = ?, ownerPrimaryContact = ?, ownerSecondaryContact = ?, leaseStatus = ?`
    const params = [
      buildingData.totalBlocks,
      buildingData.parkingSpace,
      buildingData.distanceFromRoad,
      buildingData.servantRoom,
      buildingData.generator,
      buildingData.waterDetails,
      buildingData.gateDetails,
      buildingData.price,
      buildingData.ownerName,
      buildingData.ownerCompany,
      buildingData.ownerAddress,
      buildingData.ownerPrimaryContact,
      buildingData.ownerSecondaryContact,
      buildingData.leaseStatus
    ]
    db.run(sql, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.changes)
      }
    })
  })
}

function updateBuildingImageTableDetailsQuery(buildingImageData) {
  return new Promise((resolve, reject) => {
    const getSql = `SELECT imagePath FROM building_image_details WHERE imageIndex = ? AND buildingImageId = ?`
    const updateSql = `UPDATE building_image_details SET imagePath = ? WHERE imageIndex = ? AND buildingImageId = ?`
    const params = [Number(buildingImageData.imageIndex), buildingImageData.buildingImageId]

    db.get(getSql, params, (getError, row) => {
      if (getError) {
        reject(getError)
      } else {
        const oldImagePath = row ? row.imagePath : null
        const updateParams = [buildingImageData.imagePath, ...params]

        db.run(updateSql, updateParams, function (updateError) {
          if (updateError) {
            reject(updateError)
          } else {
            resolve({ changes: this.changes, oldImagePath })
          }
        })
      }
    })
  })
}

function deleteAllBuildingTableDetailsQuery() {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE building_details SET 
      totalBlocks = NULL,
      parkingSpace = NULL,
      distanceFromRoad = NULL,
      servantRoom = NULL,
      generator = NULL,
      waterDetails = NULL,
      gateDetails = NULL,
      price = NULL,
      ownerName = NULL,
      ownerCompany = NULL,
      ownerAddress = NULL,
      ownerPrimaryContact = NULL,
      ownerSecondaryContact = NULL,
      leaseStatus = NULL`
    db.run(sql, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.changes)
      }
    })
  })
}

function deleteBuildingImageTableDetailsQuery(buildingImageData) {
  console.log('880', buildingImageData)
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM building_image_details WHERE buildingImageId = ? AND imageIndex = ?`
    db.run(
      sql,
      [buildingImageData.buildingImageId, Number(buildingImageData.imageIndex)],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes)
        }
      }
    )
  })
}

function getTaxManagerSpaceImageDetailsQuery(usernameInSession) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM taxmanager_space_image_details WHERE username = ?`
    db.all(sql, [usernameInSession], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function addTaxManagerSpaceImageDetailsQuery(usernameInSession, spaceImageData) {
  console.log('spaceimageData 927', spaceImageData, 'username', usernameInSession)
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO taxmanager_space_image_details (imagePath, username) VALUES (?, ?)'
    const params = [spaceImageData.imagePath, usernameInSession]
    db.run(sql, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.lastID)
      }
    })
  })
}

function updateTaxManagerSpaceImageDetailsQuery(usernameInSession, spaceImageData) {
  // console.log('spaceimageData 942', spaceImageData)
  return new Promise((resolve, reject) => {
    const getSql = `SELECT imagePath FROM taxmanager_space_image_details WHERE username = ? AND spaceImageId = ?` //basically sending old path back to the server for deletion
    const updateSql = `UPDATE taxmanager_space_image_details SET imagePath = ? WHERE username = ? AND spaceImageId = ?`
    const params = [usernameInSession, spaceImageData.spaceImageId]

    db.get(getSql, params, (getError, row) => {
      if (getError) {
        reject(getError)
      } else {
        const oldImagePath = row ? row.imagePath : null
        const updateParams = [spaceImageData.imagePath, ...params]

        db.run(updateSql, updateParams, function (updateError) {
          if (updateError) {
            reject(updateError)
          } else {
            console.log('all done')
            resolve({ changes: this.changes, oldImagePath })
          }
        })
      }
    })
  })
}

function deleteTaxManagerSpaceImageDetailsQuery(usernameInSession, spaceImageId) {
  //RETURNING WITH OLD PATH WHEN SUCCESSFUL REFERENCE DELETION
  // console.log('spaceimageData 942', spaceImageId, usernameInSession)
  return new Promise((resolve, reject) => {
    const getSql = `SELECT imagePath FROM taxmanager_space_image_details WHERE spaceImageId = ? AND username = ?`
    const deleteSql = `DELETE FROM taxmanager_space_image_details WHERE spaceImageId = ? AND username = ?`
    const params = [spaceImageId, usernameInSession]

    db.get(getSql, params, (getError, row) => {
      if (getError) {
        reject(getError)
      } else {
        const oldImagePath = row ? row.imagePath : null

        db.run(deleteSql, params, function (deleteError) {
          if (deleteError) {
            reject(deleteError)
          } else {
            resolve({ changes: this.changes, oldImagePath })
          }
        })
      }
    })
  })
}

function getUserDetailsQuery(userId) {
  return new Promise((resolve, reject) => {
    // First, check if the logged-in user has admin or superuser privileges
    db.get(
      `SELECT isAdmin, isSuperUser FROM user_details WHERE userid = ?`,
      [userId],
      (err, row) => {
        if (err) {
          reject(err)
        } else if (row && (row.isAdmin || row.isSuperUser)) {
          // User has sufficient privileges, proceed with fetching all user details
          db.all(`SELECT * FROM user_details`, [], (err, rows) => {
            if (err) {
              reject(err)
            } else {
              resolve(rows)
            }
          })
        } else {
          // User doesn't have sufficient privileges
          reject('Insufficient privileges')
        }
      }
    )
  })
}

function getUserDetailQuery(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT firstName, lastName, username, contact FROM user_details WHERE userid = ?`,
      [userId],
      (err, row) => {
        if (err) {
          console.log('error')
          reject(err)
        } else {
          console.log(row)
          resolve(row)
        }
      }
    )
  })
}

function getSalaryIncentivesDetailsQuery(userId) {
  return new Promise((resolve, reject) => {
    // First, check if the logged-in user has admin or superuser privileges
    db.get(
      `SELECT isAdmin, isSuperUser FROM user_details WHERE userid = ?`,
      [userId],
      (err, row) => {
        if (err) {
          reject(err)
        } else if (row && (row.isAdmin || row.isSuperUser)) {
          // User has sufficient privileges, proceed with fetching specific user details
          db.all(
            `SELECT userid, username, firstName, lastName, base_salary, bonus, incentives FROM user_details`,
            [],
            (err, rows) => {
              if (err) {
                reject(err)
              } else {
                resolve(rows)
              }
            }
          )
        } else {
          // User doesn't have sufficient privileges
          reject('Insufficient privileges')
        }
      }
    )
  })
}

function getPettyDetailsQuery(userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM petty_details WHERE userId = ?`, [userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getCashAccountDetailsQuery(userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM cash_account_details WHERE userId = ?`, [userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function addUserDetailsQuery(loggedInUserId, userData) {
  console.log('userData', userData)
  return new Promise((resolve, reject) => {
    // Check if username is empty
    if (!userData.username) {
      reject('Username cannot be empty')
      return
    }

    // First, check if the logged-in user has admin or superuser privileges
    db.get(
      `SELECT isAdmin, isSuperUser FROM user_details WHERE userid = ?`,
      [loggedInUserId],
      (err, row) => {
        if (err) {
          reject(err)
        } else if (row && (row.isAdmin || row.isSuperUser)) {
          // User has sufficient privileges, proceed with adding new user

          // If logged in user is admin but not superuser, remove isSuperUser from userData
          if (row.isAdmin && !row.isSuperUser) {
            delete userData.isSuperUser
          }

          db.run(
            `INSERT INTO user_details(firstName, lastName, username, password, contact, secondaryContact, isAdmin, isSuperUser) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userData.firstName,
              userData.lastName,
              userData.username,
              Math.floor(100000 + Math.random() * 900000),
              userData.contact,
              userData.secondaryContact, //secondaryContct
              userData.isAdmin,
              userData.isSuperUser ? userData.isSuperUser : 0
            ],
            function (err) {
              if (err) {
                reject(err)
              } else {
                resolve(this.lastID)
              }
            }
          )
        } else {
          // User doesn't have sufficient privileges
          reject('Insufficient privileges')
        }
      }
    )
  })
}

function addPettyDetailsQuery(userId, pettyData) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO petty_details(userId, date, description, amount) VALUES(?, ?, ?, ?)`,
      [userId, pettyData.date, pettyData.description, pettyData.amount],
      function (err) {
        if (err) {
          reject(err)
        } else {
          // console.log(`A row has been inserted with rowid ${this.lastID}`)
          resolve(this.lastID)
        }
      }
    )
  })
}

function addCashAccountDetailsQuery(userId, cashAccountData) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO cash_account_details(userId, date, description, amount) VALUES(?, ?, ?, ?)`,
      [userId, cashAccountData.date, cashAccountData.description, cashAccountData.amount],
      function (err) {
        if (err) {
          reject(err)
        } else {
          // console.log(`A row has been inserted with rowid ${this.lastID}`)
          resolve(this.lastID)
        }
      }
    )
  })
}

function addFacilityDetailsQuery(facilityData) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO facility_details (
        facilityType, providerName, contractStart, contractEnd, contractCost, 
        services, frequency, contactInformation, estimatedCharge, status, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    db.run(
      sql,
      [
        facilityData.facilityType ?? 'n/a',
        facilityData.providerName ?? 'n/a',
        facilityData.contractStart ?? 'n/a',
        facilityData.contractEnd ?? 'n/a',
        facilityData.contractCost ?? '0',
        facilityData.services ?? 'n/a',
        facilityData.frequency ?? 'n/a',
        facilityData.contactInformation ?? 'n/a',
        facilityData.estimatedCharge ?? '0',
        facilityData.status ?? 'unfixed',
        facilityData.remarks ?? 'n/a'
      ],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({ id: this.lastID })
        }
      }
    )
  })
}

function getPayableDetailsQuery(userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM payable_details WHERE userId = ?`, [userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getReceivableDetailsQuery(userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM receivable_details WHERE userId = ?`, [userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getAdvanceDetailsQuery(userId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM advance_details WHERE userId = ?`, [userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function addPayableDetailsQuery(userId, payableData) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO payable_details(userId, date, description, amount, payable_to) VALUES(?, ?, ?, ?, ?)`,
      [
        userId,
        payableData.date,
        payableData.description,
        payableData.amount,
        payableData.payReceive
      ],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.lastID)
        }
      }
    )
  })
}

function addReceivableDetailsQuery(userId, receivableData) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO receivable_details(userId, date, description, amount, receivable_from) VALUES(?, ?, ?, ?, ?)`,
      [
        userId,
        receivableData.date,
        receivableData.description,
        receivableData.amount,
        receivableData.payReceive
      ],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.lastID)
        }
      }
    )
  })
}

function addAdvanceDetailsQuery(userId, advanceData) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO advance_details(userId, amount, recipient, dateIssued, dateSettled, status) VALUES(?, ?, ?, ?, ?, ?)`,
      [
        userId,
        advanceData.amount,
        advanceData.recipient,
        advanceData.dateIssued,
        advanceData.dateSettled,
        advanceData.status
      ],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.lastID)
        }
      }
    )
  })
}

function updateUserDetailsQuery(loggedInUserId, userDataArray) {
  console.log('loggedInUserId', loggedInUserId, 'userDataArray', userDataArray)
  return new Promise((resolve, reject) => {
    // First, check if the user has admin or superuser privileges
    db.get(
      `SELECT isAdmin, isSuperUser FROM user_details WHERE userid = ?`,
      [loggedInUserId],
      (err, row) => {
        if (err) {
          reject(err)
        } else {
          const { isAdmin, isSuperUser } = row // Save isAdmin and isSuperUser values

          // If both isAdmin and isSuperUser are falsy, reject the promise
          if (!isAdmin && !isSuperUser) {
            reject('Insufficient privileges')
            return
          }

          let totalChanges = 0
          const promises = userDataArray.map((userData) => {
            console.log('userId', userData.userid)
            console.log('isAdmin', isAdmin, 'isSuperUser', isSuperUser)

            if (isAdmin && !isSuperUser) {
              // Admin user: deny isSuperUser changes
              if (userData.hasOwnProperty('isSuperUser')) {
                delete userData.isSuperUser
              }
            } else if (isSuperUser) {
              // Superuser: deny self demotion
              console.log('i am super')
              if (loggedInUserId === userData.userid && userData.isSuperUser === 0) {
                delete userData.isSuperUser
              }
            } else {
              // Unauthorized user
              reject('Insufficient privileges')
              return
            }

            // Dynamically construct the SQL query and its parameters
            const fields = Object.keys(userData).filter((key) => key !== 'userid')
            if (fields.length === 0) {
              reject('Error 403: Forbidden Request')
              return
            }
            const query = `UPDATE user_details SET ${fields
              .map((field) => `${field} = ?`)
              .join(', ')} WHERE userid = ?`
            const params = [...fields.map((field) => userData[field]), userData.userid]

            return new Promise((resolve, reject) => {
              db.run(query, params, function (err) {
                if (err) {
                  reject(err)
                } else {
                  totalChanges += this.changes
                  resolve()
                }
              })
            })
          })

          Promise.all(promises)
            .then(() => resolve(totalChanges))
            .catch((err) => {
              console.error(err)
              reject(err)
            })
        }
      }
    )
  })
}

async function updateUserDetailQuery(userId, userData) {
  // console.log('userdata', userData)
  return new Promise(async (resolve, reject) => {
    let query = 'UPDATE user_details SET '
    let params = []

    if (userData.username !== null && userData.username !== '') {
      query += 'username = ?, '
      params.push(userData.username)
    }

    if (userData.password !== null && userData.password !== '') {
      try {
        const hash = await bcrypt.hash(userData.password, 10)
        query += 'password = ?, '
        params.push(hash)
      } catch (err) {
        reject(err)
        return
      }
    }

    // If neither username nor password is provided, reject the promise
    if (params.length === 0) {
      reject('No fields provided for update')
      return
    }

    // Remove trailing comma and space
    query = query.slice(0, -2)

    query += ' WHERE userid = ?'
    params.push(userId)

    db.run(query, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve('User details updated successfully')
      }
    })
  })
}

function updateSalaryIncentivesDetailsQuery(loggedInUserId, salaryDataArray) {
  console.log('loggedInUserId', loggedInUserId, 'salaryDataArray', salaryDataArray)
  return new Promise((resolve, reject) => {
    // First, check if the user has admin or superuser privileges
    db.get(
      `SELECT isAdmin, isSuperUser FROM user_details WHERE userid = ?`,
      [loggedInUserId],
      (err, row) => {
        if (err) {
          reject(err)
        } else {
          const { isAdmin, isSuperUser } = row // Save isAdmin and isSuperUser values

          // If both isAdmin and isSuperUser are falsy, reject the promise
          if (!isAdmin && !isSuperUser) {
            reject('Insufficient privileges')
            return
          }

          let totalChanges = 0
          const promises = salaryDataArray.map((salaryData) => {
            console.log('userId', salaryData.userid)
            console.log('isAdmin', isAdmin, 'isSuperUser', isSuperUser)

            const query = `UPDATE user_details SET base_salary = ?, bonus = ?, incentives = ? WHERE userid = ?`
            const params = [
              salaryData.base_salary,
              salaryData.bonus,
              salaryData.incentives,
              salaryData.userid
            ]

            return new Promise((resolve, reject) => {
              db.run(query, params, function (err) {
                if (err) {
                  reject(err)
                } else {
                  totalChanges += this.changes
                  resolve()
                }
              })
            })
          })

          Promise.all(promises)
            .then(() => resolve(totalChanges))
            .catch((err) => {
              console.error(err)
              reject(err)
            })
        }
      }
    )
  })
}

function updatePettyDetailsQuery(userId, pettyDataArray) {
  console.log('userId', userId, 'pettyDataArray', pettyDataArray)
  let totalChanges = 0
  const promises = pettyDataArray.map((pettyData) => {
    console.log('pettyId', pettyData.pettyId)
    const query = `UPDATE petty_details SET date = ?, description = ?, amount = ? WHERE pettyId = ? AND userId = ?`
    const params = [
      pettyData.date,
      pettyData.description,
      pettyData.amount,
      pettyData.pettyId,
      userId
    ]

    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) {
          reject(err)
        } else {
          totalChanges += this.changes
          resolve()
        }
      })
    })
  })

  return Promise.all(promises).then(() => {
    console.log(`Total row(s) updated: ${totalChanges}`)
    return totalChanges
  })
}

function updateCashAccountDetailsQuery(userId, cashAccountDataArray) {
  console.log('userId', userId, 'cashAccountDataArray', cashAccountDataArray)
  let totalChanges = 0
  const promises = cashAccountDataArray.map((cashAccountData) => {
    console.log('cashAccountId', cashAccountData.cashAccountId)
    const query = `UPDATE cash_account_details SET date = ?, description = ?, amount = ? WHERE cashAccountId = ? AND userId = ?`
    const params = [
      cashAccountData.date,
      cashAccountData.description,
      cashAccountData.amount,
      cashAccountData.cashAccountId,
      userId
    ]

    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) {
          reject(err)
        } else {
          totalChanges += this.changes
          resolve()
        }
      })
    })
  })

  return Promise.all(promises).then(() => {
    console.log(`Total row(s) updated: ${totalChanges}`)
    return totalChanges
  })
}

function updatePayableDetailsQuery(loggedInUserId, payableDataArray) {
  console.log('loggedInUserId', loggedInUserId, 'payableDataArray', payableDataArray)
  let totalChanges = 0

  // Create an array of promises for each database update operation
  const updatePromises = payableDataArray.map((payableData) => {
    console.log('payableId', payableData.payableId)
    const query = `UPDATE payable_details SET date = ?, description = ?, amount = ?, payable_to = ? WHERE payableId = ? AND userid = ?`
    const params = [
      payableData.date,
      payableData.description,
      payableData.amount,
      payableData.payable_to,
      payableData.payableId,
      loggedInUserId
    ]

    // Wrap the db.run operation in a promise
    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) {
          reject(err)
        } else {
          totalChanges += this.changes
          resolve() // Resolve the promise when the update is complete
        }
      })
    })
  })

  // Use Promise.all to wait for all update promises to resolve
  return Promise.all(updatePromises)
    .then(() => {
      console.log(`Total row(s) updated: ${totalChanges}`)
      return totalChanges
    })
    .catch((err) => {
      console.error('Error updating database:', err)
      throw err // Rethrow the error to be caught by the caller
    })
}

function updateReceivableDetailsQuery(loggedInUserId, receivableDataArray) {
  console.log('loggedInUserId', loggedInUserId, 'receivableDataArray', receivableDataArray)
  let totalChanges = 0

  // Create an array of promises for each database update operation
  const updatePromises = receivableDataArray.map((receivableData) => {
    console.log('receivableId', receivableData.receivableId)
    const query = `UPDATE receivable_details SET date = ?, description = ?, amount = ?, receivable_from = ? WHERE receivableId = ? AND userid = ?`
    const params = [
      receivableData.date,
      receivableData.description,
      receivableData.amount,
      receivableData.receivable_from,
      receivableData.receivableId,
      loggedInUserId
    ]

    // Wrap the db.run operation in a promise
    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) {
          reject(err)
        } else {
          totalChanges += this.changes
          resolve() // Resolve the promise when the update is complete
        }
      })
    })
  })

  // Use Promise.all to wait for all update promises to resolve
  return Promise.all(updatePromises)
    .then(() => {
      console.log(`Total row(s) updated: ${totalChanges}`)
      return totalChanges
    })
    .catch((err) => {
      console.error('Error updating database:', err)
      throw err // Rethrow the error to be caught by the caller
    })
}

function updateAdvanceDetailsQuery(userId, advanceDataArray) {
  console.log('userId', userId, 'advanceDataArray', advanceDataArray)
  let totalChanges = 0

  // Create an array of promises for each database update operation
  const updatePromises = advanceDataArray.map((advanceData) => {
    console.log('advanceId', advanceData.advanceId)
    const query = `UPDATE advance_details SET amount = ?, recipient = ?, dateIssued = ?, dateSettled = ?, status = ? WHERE advanceId = ? AND userId = ?`
    const params = [
      advanceData.amount,
      advanceData.recipient,
      advanceData.dateIssued,
      advanceData.dateSettled,
      advanceData.status,
      advanceData.advanceId,
      userId
    ]

    // Wrap the db.run operation in a promise
    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) {
          reject(err)
        } else {
          totalChanges += this.changes
          resolve() // Resolve the promise when the update is complete
        }
      })
    })
  })

  // Use Promise.all to wait for all update promises to resolve
  return Promise.all(updatePromises)
    .then(() => {
      console.log(`Total row(s) updated: ${totalChanges}`)
      return totalChanges
    })
    .catch((err) => {
      console.error('Error updating database:', err)
      throw err // Rethrow the error to be caught by the caller
    })
}

function updateFacilityDetailsQuery(facilityDataArray) {
  return new Promise((resolve, reject) => {
    let totalChanges = 0
    const promises = facilityDataArray.map((facilityData) => {
      if (facilityData.facilityId == null) {
        reject('facilityId is required')
        return
      }

      const query = `
        UPDATE facility_details 
        SET facilityType = ?, providerName = ?, contractStart = ?, contractEnd = ?, contractCost = ?, 
            services = ?, frequency = ?, contactInformation = ?, estimatedCharge = ?, status = ?, remarks = ?
        WHERE facilityId = ?
      `
      const params = [
        facilityData.facilityType ?? 'n/a',
        facilityData.providerName ?? 'n/a',
        facilityData.contractStart ?? 'n/a',
        facilityData.contractEnd ?? 'n/a',
        facilityData.contractCost ?? '0',
        facilityData.services ?? 'n/a',
        facilityData.frequency ?? 'n/a',
        facilityData.contactInformation ?? 'n/a',
        facilityData.estimatedCharge ?? '0',
        facilityData.status ?? 'unfixed',
        facilityData.remarks ?? 'n/a',
        facilityData.facilityId
      ]

      return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
          if (err) {
            reject(err)
          } else {
            totalChanges += this.changes
            resolve()
          }
        })
      })
    })

    Promise.all(promises)
      .then(() => resolve(totalChanges))
      .catch((err) => {
        console.error(err)
        reject(err)
      })
  })
}

function deleteUserDetailsQuery(userId, userDetailIds) {
  console.log('userId', userId, 'userDetailIds', userDetailIds)
  return new Promise((resolve, reject) => {
    // Reject if userId is in userDetailIds
    if (userDetailIds.includes(userId)) {
      reject('Cannot delete self')
      return
    }

    // First, check if the user has admin or superuser privileges
    db.get(
      `SELECT isAdmin, isSuperUser FROM user_details WHERE userid = ?`,
      [userId],
      (err, row) => {
        if (err) {
          reject(err)
        } else if (row && (row.isAdmin || row.isSuperUser)) {
          // User has sufficient privileges, proceed with deletion
          if (userDetailIds.length === 0) {
            resolve(0)
            return
          }
          const placeholders = userDetailIds.map(() => '?').join(',')
          const query = `DELETE FROM user_details WHERE userid IN (${placeholders})`

          db.run(query, userDetailIds, function (err) {
            if (err) {
              reject(err)
            } else {
              console.log(`Row(s) deleted ${this.changes}`)
              resolve(this.changes)
            }
          })
        } else {
          // User doesn't have sufficient privileges
          reject('Insufficient privileges')
        }
      }
    )
  })
}

function deletePettyDetailsQuery(userId, pettyIds) {
  console.log('userId', userId, 'pettyIds', pettyIds)
  return new Promise((resolve, reject) => {
    if (pettyIds.length === 0) {
      resolve(0)
      return
    }
    //can delete multiple rows at once
    const placeholders = pettyIds.map(() => '?').join(',')
    const query = `DELETE FROM petty_details WHERE userId = ? AND pettyId IN (${placeholders})`

    db.run(query, [userId, ...pettyIds], function (err) {
      if (err) {
        reject(err)
      } else {
        console.log(`Row(s) deleted ${this.changes}`)
        resolve(this.changes)
      }
    })
  })
}

function deleteCashAccountDetailsQuery(userId, cashAccountIds) {
  return new Promise((resolve, reject) => {
    if (cashAccountIds.length === 0) {
      resolve(0)
      return
    }

    const placeholders = cashAccountIds.map(() => '?').join(',')
    const query = `DELETE FROM cash_account_details WHERE userId = ? AND cashAccountId IN (${placeholders})`

    db.run(query, [userId, ...cashAccountIds], function (err) {
      if (err) {
        reject(err)
      } else {
        console.log(`Row(s) deleted ${this.changes}`)
        resolve(this.changes)
      }
    })
  })
}

function deletePayableDetailsQuery(userId, payableIds) {
  return new Promise((resolve, reject) => {
    if (payableIds.length === 0) {
      resolve(0)
      return
    }
    const placeholders = payableIds.map(() => '?').join(',')
    const query = `DELETE FROM payable_details WHERE userId = ? AND payableId IN (${placeholders})`

    db.run(query, [userId, ...payableIds], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.changes)
      }
    })
  })
}

function deleteReceivableDetailsQuery(userId, receivableIds) {
  return new Promise((resolve, reject) => {
    if (receivableIds.length === 0) {
      resolve(0)
      return
    }
    const placeholders = receivableIds.map(() => '?').join(',')
    const query = `DELETE FROM receivable_details WHERE userId = ? AND receivableId IN (${placeholders})`

    db.run(query, [userId, ...receivableIds], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.changes)
      }
    })
  })
}

function deleteAdvanceDetailsQuery(userId, advanceIds) {
  console.log('userId', userId, 'advanceIds', advanceIds)
  return new Promise((resolve, reject) => {
    if (advanceIds.length === 0) {
      resolve(0)
      return
    }
    //can delete multiple rows at once
    const placeholders = advanceIds.map(() => '?').join(',')
    const query = `DELETE FROM advance_details WHERE userId = ? AND advanceId IN (${placeholders})`

    db.run(query, [userId, ...advanceIds], function (err) {
      if (err) {
        reject(err)
      } else {
        console.log(`Row(s) deleted ${this.changes}`)
        resolve(this.changes)
      }
    })
  })
}

function deleteFacilityDetailsQuery(facilityIds) {
  return new Promise((resolve, reject) => {
    if (facilityIds.length === 0) {
      resolve(0)
      return
    }

    const placeholders = facilityIds.map(() => '?').join(',')
    const query = `DELETE FROM facility_details WHERE facilityId IN (${placeholders})`

    db.run(query, facilityIds, function (err) {
      if (err) {
        reject(err)
      } else {
        console.log(`Row(s) deleted ${this.changes}`)
        resolve(this.changes)
      }
    })
  })
}

function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    // Query the database for the user with the given username
    db.get(
      'SELECT userid, username, password, isAdmin, isSuperUser FROM user_details WHERE username = ?',
      [username],
      (err, row) => {
        if (err) {
          reject(err)
        } else if (row) {
          // If the user exists, check if the password is hashed
          if (row.password.startsWith('$2b$10$')) {
            // If the password is hashed, compare the given password with the hashed password in the database
            bcrypt.compare(password, row.password, (err, result) => {
              if (err) {
                reject(err)
              } else {
                // If the passwords match, resolve with the user details, otherwise resolve with false
                if (result) {
                  const { password, ...userRecord } = row
                  resolve(userRecord)
                } else {
                  resolve(false)
                }
              }
            })
          } else {
            // If the password is not hashed, compare it directly
            if (password === row.password) {
              const { password, ...userRecord } = row
              resolve(userRecord)
            } else {
              resolve(false)
            }
          }
        } else {
          // If the user does not exist, resolve with false
          resolve(false)
        }
      }
    )
  })
}

module.exports = {
  db,
  dbPath,
  sqlite3,
  authenticateUser,
  getAllSpaceDetailsQuery,
  addNewSpaceQuery,
  deleteSpaceQuery,
  getAllLeaseDetailsQuery,
  addNewLeaseQuery,
  editExistingLeaseQuery,
  deleteLeaseQuery,
  getLeaseDetailsUsernameQuery,
  getIndividualLeaseQuery,
  updatePANPhotoQuery,
  updateCitizenPhotoQuery,
  updatePassportPhotoQuery,
  getIncomeDetailsQuery,
  getExpenditureDetailsQuery,
  addIncomeDetailsQuery,
  addExpenditureDetailsQuery,
  updateIncomeDetailsQuery,
  updateExpenditureDetailsQuery,
  deleteIncomeDetailsQuery,
  deleteExpenditureDetailsQuery,
  getBuildingTableDetailsQuery,
  getBuildingImageDetailsQuery,
  addBuildingImageTableDetailsQuery,
  updateBuildingTableDetailsQuery,
  updateBuildingImageTableDetailsQuery,
  deleteAllBuildingTableDetailsQuery,
  deleteBuildingImageTableDetailsQuery,
  getTaxManagerSpaceImageDetailsQuery,
  addTaxManagerSpaceImageDetailsQuery,
  updateTaxManagerSpaceImageDetailsQuery,
  deleteTaxManagerSpaceImageDetailsQuery,
  getPettyDetailsQuery,
  getCashAccountDetailsQuery,
  addPettyDetailsQuery,
  addCashAccountDetailsQuery,
  updatePettyDetailsQuery,
  updateCashAccountDetailsQuery,
  deletePettyDetailsQuery,
  deleteCashAccountDetailsQuery,
  getPayableDetailsQuery,
  getReceivableDetailsQuery,
  addPayableDetailsQuery,
  addReceivableDetailsQuery,
  updatePayableDetailsQuery,
  updateReceivableDetailsQuery,
  deletePayableDetailsQuery,
  deleteReceivableDetailsQuery,
  getAdvanceDetailsQuery,
  addAdvanceDetailsQuery,
  updateAdvanceDetailsQuery,
  deleteAdvanceDetailsQuery,
  getUserDetailsQuery,
  getUserDetailQuery,
  addUserDetailsQuery,
  updateUserDetailsQuery,
  updateUserDetailQuery,
  deleteUserDetailsQuery,
  getSalaryIncentivesDetailsQuery,
  updateSalaryIncentivesDetailsQuery,
  getAllFacilityDetailsQuery,
  addFacilityDetailsQuery,
  updateFacilityDetailsQuery,
  deleteFacilityDetailsQuery
}
