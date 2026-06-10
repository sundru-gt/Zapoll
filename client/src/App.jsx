import { useEffect } from 'react'
import axiosInstance from './api/axiosInstance'

function App() {
  useEffect(() => {
    axiosInstance.get('/health')
      .then(res => console.log('Backend says:', res.data))
      .catch(err => console.error('Connection failed:', err))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">⚡ Zappoll</h1>
    </div>
  )
}

export default App