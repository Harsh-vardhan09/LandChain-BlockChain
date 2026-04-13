const axios = require('axios')
const FormData = require('form-data')

class IPFSService {
  constructor() {
    this.jwt = process.env.PINATA_JWT

    if (!this.jwt) {
      console.warn('⚠️ Pinata JWT not found. IPFS uploads will be disabled.')
    }
  }

  /**
   * Upload single file to IPFS via Pinata
   */
  async uploadFile(fileBuffer, fileName, mimeType) {
    if (!this.jwt) {
      throw new Error('Pinata not configured.')
    }

    try {
      const formData = new FormData()

      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: mimeType
      })

      // Optional metadata (shows in Pinata dashboard)
      formData.append(
        'pinataMetadata',
        JSON.stringify({
          name: fileName
        })
      )

      const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.jwt}`
          }
        }
      )

      return {
        cid: res.data.IpfsHash,
        url: this.getGatewayUrl(res.data.IpfsHash)
      }

    } catch (error) {
      console.error('❌ Pinata upload error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })

      throw new Error('Failed to upload file to IPFS')
    }
  }

  /**
   * Upload multiple files (folder upload)
   */
  async uploadFiles(files) {
    if (!this.jwt) {
      throw new Error('Pinata not configured.')
    }

    try {
      const formData = new FormData()

      files.forEach((file) => {
        formData.append('file', file.buffer, {
          filepath: file.name, // enables folder structure
          contentType: file.type
        })
      })

      formData.append(
        'pinataMetadata',
        JSON.stringify({
          name: 'folder-upload'
        })
      )

      const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.jwt}`
          }
        }
      )

      return {
        cid: res.data.IpfsHash,
        url: this.getGatewayUrl(res.data.IpfsHash)
      }

    } catch (error) {
      console.error('❌ Multiple upload error:', error.response?.data || error.message)
      throw new Error('Failed to upload files')
    }
  }

  /**
   * Get gateway URL
   */
  getGatewayUrl(cid) {
    return `https://gateway.pinata.cloud/ipfs/${cid}`
  }

  /**
   * Check availability
   */
  isAvailable() {
    return !!this.jwt
  }
}

module.exports = new IPFSService()