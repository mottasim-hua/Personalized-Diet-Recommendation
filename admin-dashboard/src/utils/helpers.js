import { toast } from 'react-toastify'

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Show success toast
 */
export const showSuccess = (message) => {
  toast.success(message, {
    position: 'bottom-right',
    autoClose: 3000,
  })
}

/**
 * Show error toast
 */
export const showError = (message) => {
  toast.error(message, {
    position: 'bottom-right',
    autoClose: 3000,
  })
}

/**
 * Show info toast
 */
export const showInfo = (message) => {
  toast.info(message, {
    position: 'bottom-right',
    autoClose: 3000,
  })
}

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Truncate text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

/**
 * Convert array to CSV and download
 */
export const downloadCSV = (data, filename = 'data.csv') => {
  const csv = convertArrayToCSV(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Convert array to CSV format
 */
const convertArrayToCSV = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csv = [headers.join(',')]

  for (const item of data) {
    const row = headers.map((header) => {
      const value = item[header]
      // Escape quotes in values
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    })
    csv.push(row.join(','))
  }

  return csv.join('\n')
}
