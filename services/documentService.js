const ipfsService = require('./ipfsService')

/**
 * Upload document to IPFS and return hash
 */
async function uploadDocument(fileBuffer, fileName, mimeType) {
  if (!ipfsService.isAvailable()) {
    throw new Error('IPFS service is not available. Please configure WEB3_STORAGE_TOKEN.')
  }

  try {
    const cid = await ipfsService.uploadFile(fileBuffer, fileName, mimeType)
    return {
      hash: cid,
      url: ipfsService.getGatewayUrl(cid),
      success: true
    }
  } catch (error) {
    console.error('Document upload error:', error)
    throw new Error('Failed to upload document to IPFS')
  }
}

/**
 * Get document URL from hash
 */
function getDocumentUrl(hash) {
  if (!hash) return null
  return ipfsService.getGatewayUrl(hash)
}

/**
 * Register land with document
 */
async function registerLandWithDocument(id, location, area, owner, documentBuffer, documentName, documentType) {
  try {
    // Upload document to IPFS
    const documentResult = await uploadDocument(documentBuffer, documentName, documentType)

    // Register land on blockchain with document hash
    const receipt = await landService.registerLand(id, location, area, owner, documentResult.hash)

    return {
      receipt,
      documentHash: documentResult.hash,
      documentUrl: documentResult.url
    }
  } catch (error) {
    console.error('Error registering land with document:', error)
    throw error
  }
}

/**
 * Transfer ownership with document
 */
async function transferOwnershipWithDocument(id, newOwner, documentBuffer, documentName, documentType) {
  try {
    // Upload transfer document to IPFS
    const documentResult = await uploadDocument(documentBuffer, documentName, documentType)

    // Transfer ownership on blockchain with document hash
    const receipt = await landService.transferOwnership(id, newOwner, documentResult.hash)

    return {
      receipt,
      documentHash: documentResult.hash,
      documentUrl: documentResult.url
    }
  } catch (error) {
    console.error('Error transferring ownership with document:', error)
    throw error
  }
}

module.exports = {
  uploadDocument,
  getDocumentUrl,
  registerLandWithDocument,
  transferOwnershipWithDocument,
}