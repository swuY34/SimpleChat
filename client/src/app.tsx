import React from 'react'
import AppLayout from './components/Layout'

const App: React.FC = () => {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Main Content</h1>
      <p>This is the main content area.</p>
    </AppLayout>
  )
}

export default App