import api from './axiosConfig'

// ============ STATS ENDPOINTS ============
export const getStats = async () => {
  const response = await api.get('/api/admin/stats.php')
  return response.data
}

// ============ USERS ENDPOINTS ============
export const getUsers = async () => {
  const response = await api.get('/api/admin/users.php')
  return response.data
}

export const createUser = async (userData) => {
  const response = await api.post('/api/admin/users.php', userData)
  return response.data
}

export const updateUser = async (userId, userData) => {
  const response = await api.post('/api/admin/users.php', {
    id: userId,
    ...userData,
  })
  return response.data
}

export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/admin/users.php?id=${userId}`)
  return response.data
}

// ============ DIETITIANS ENDPOINTS ============
export const getDietitians = async () => {
  const response = await api.get('/api/admin/dietitians.php')
  return response.data
}

export const createDietitian = async (data) => {
  const response = await api.post('/api/admin/dietitians.php', data)
  return response.data
}

export const updateDietitian = async (id, data) => {
  const response = await api.post('/api/admin/dietitians.php', {
    id,
    ...data,
  })
  return response.data
}

export const deleteDietitian = async (id) => {
  const response = await api.delete(`/api/admin/dietitians.php?id=${id}`)
  return response.data
}

export const approveDietitian = async (id) => {
  const response = await api.post('/api/admin/dietitians.php', {
    id,
    action: 'approve',
  })
  return response.data
}

// ============ PLANS ENDPOINTS ============
export const getPlans = async () => {
  const response = await api.get('/api/admin/plans.php')
  return response.data
}

export const createPlan = async (planData) => {
  const response = await api.post('/api/admin/plans.php', planData)
  return response.data
}

export const updatePlan = async (planId, planData) => {
  const response = await api.post('/api/admin/plans.php', {
    id: planId,
    ...planData,
  })
  return response.data
}

export const deletePlan = async (planId) => {
  const response = await api.delete(`/api/admin/plans.php?id=${planId}`)
  return response.data
}
