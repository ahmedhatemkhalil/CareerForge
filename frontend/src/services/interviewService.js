import api from './api'

export const getAllInterviews = async () => {
  const { data } = await api.get('/interviews')
  return data
}
