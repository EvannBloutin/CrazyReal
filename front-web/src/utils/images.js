const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const getImageUrl = (filePath) => {
  if (!filePath) return null
  return `${API_URL}/${filePath}`
}

export default { getImageUrl }