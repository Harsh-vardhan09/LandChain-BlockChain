const landService = require('./landService')
const dbService = require('./dbService')

/**
 * Sync blockchain events to database
 */
async function syncLandEvents() {
  try {
    console.log('Starting blockchain event sync...')

    // Get all lands from blockchain
    const totalLands = await landService.getTotalLands()
    console.log(`Found ${totalLands} lands on blockchain`)

    for (let i = 1; i <= totalLands; i++) {
      try {
        const landData = await landService.getLand(i)
        const landId = landData[0].toString()

        // Check if land exists in DB
        let dbLand = await dbService.getLandById(landId)

        if (!dbLand) {
          // Create new land in DB
          dbLand = await dbService.saveLand({
            landId,
            location: landData[1],
            area: parseInt(landData[2].toString()),
            owner: landData[3].toLowerCase(),
            verified: landData[4],
            documentHash: landData[5] || '',
            createdAt: new Date(parseInt(landData[6]) * 1000),
            verifiedAt: landData[7] > 0 ? new Date(parseInt(landData[7]) * 1000) : null,
          })
          console.log(`Created land ${landId} in database`)
        } else {
          // Update existing land
          await dbService.updateLandVerification(landId, landData[4])
          if (landData[7] > 0 && !dbLand.verifiedAt) {
            await dbService.updateLandVerification(landId, true, new Date(parseInt(landData[7]) * 1000))
          }
          console.log(`Updated land ${landId} in database`)
        }

        // Sync transactions for this land
        await syncLandTransactions(i)

      } catch (error) {
        console.error(`Error syncing land ${i}:`, error)
        continue
      }
    }

    console.log('Blockchain event sync completed')
  } catch (error) {
    console.error('Error in blockchain sync:', error)
    throw error
  }
}

/**
 * Sync transactions for a specific land
 */
async function syncLandTransactions(landId) {
  try {
    const transactionIds = await landService.getLandTransactions(landId)

    for (const txId of transactionIds) {
      try {
        const txData = await landService.getTransaction(txId)

        const transaction = {
          transactionId: txData[0].toString(),
          from: txData[2].toLowerCase(),
          to: txData[3].toLowerCase(),
          timestamp: new Date(parseInt(txData[6]) * 1000),
          transactionType: getTransactionTypeName(txData[4]),
          documentHash: txData[5] || '',
          blockNumber: parseInt(txData[7].toString()),
          transactionHash: '', // Will be filled from events if available
        }

        // Add transaction to land in DB
        await dbService.addLandTransaction(landId.toString(), transaction)

      } catch (error) {
        console.error(`Error syncing transaction ${txId} for land ${landId}:`, error)
        continue
      }
    }
  } catch (error) {
    console.error(`Error syncing transactions for land ${landId}:`, error)
  }
}

/**
 * Convert transaction type enum to string
 */
function getTransactionTypeName(typeEnum) {
  const types = ['REGISTER', 'VERIFY', 'TRANSFER']
  return types[typeEnum] || 'UNKNOWN'
}

/**
 * Get transaction history for a land
 */
async function getLandTransactionHistory(landId) {
  try {
    const land = await dbService.getLandById(landId)
    if (!land) {
      throw new Error('Land not found')
    }

    return land.transactions || []
  } catch (error) {
    console.error('Error getting transaction history:', error)
    throw error
  }
}

/**
 * Get all transactions across all lands (admin only)
 */
async function getAllTransactions(limit = 100, offset = 0) {
  try {
    return await dbService.getAllTransactions(limit, offset)
  } catch (error) {
    console.error('Error getting all transactions:', error)
    throw error
  }
}

module.exports = {
  syncLandEvents,
  syncLandTransactions,
  getLandTransactionHistory,
  getAllTransactions,
}