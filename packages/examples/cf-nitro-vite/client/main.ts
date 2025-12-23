// Main TypeScript entry point for the Vite frontend

// Helper to display results
function showResult(elementId: string, data: any, isError = false) {
  const element = document.getElementById(elementId)
  if (element) {
    element.style.display = 'block'
    element.textContent = JSON.stringify(data, null, 2)
    if (isError) {
      element.classList.add('error')
    } else {
      element.classList.remove('error')
    }
  }
}

// D1 Database - Get Users
document.getElementById('getUsers')?.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/users')
    const data = await response.json()
    showResult('usersResult', data)
  } catch (error: any) {
    showResult('usersResult', { error: error.message }, true)
  }
})

// D1 Database - Create User
document.getElementById('createUser')?.addEventListener('click', async () => {
  const name = (document.getElementById('userName') as HTMLInputElement)?.value
  const email = (document.getElementById('userEmail') as HTMLInputElement)?.value
  
  if (!name || !email) {
    showResult('usersResult', { error: 'Name and email are required' }, true)
    return
  }
  
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    })
    const data = await response.json()
    showResult('usersResult', data)
    
    // Clear inputs
    ;(document.getElementById('userName') as HTMLInputElement).value = ''
    ;(document.getElementById('userEmail') as HTMLInputElement).value = ''
  } catch (error: any) {
    showResult('usersResult', { error: error.message }, true)
  }
})

// KV Store - Get Session
document.getElementById('getSession')?.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/sessions')
    const sessionId = await response.text()
    showResult('sessionResult', { sessionId })
  } catch (error: any) {
    showResult('sessionResult', { error: error.message }, true)
  }
})

// R2 Blob - List Files
document.getElementById('getFiles')?.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/files')
    const data = await response.json()
    showResult('filesResult', data)
  } catch (error: any) {
    showResult('filesResult', { error: error.message }, true)
  }
})

// R2 Blob - Upload File
document.getElementById('uploadFile')?.addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement
  const file = fileInput?.files?.[0]
  
  if (!file) {
    showResult('filesResult', { error: 'No file selected' }, true)
    return
  }
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/files', {
      method: 'POST',
      body: formData,
    })
    const data = await response.json()
    showResult('filesResult', data)
    
    // Clear file input
    fileInput.value = ''
  } catch (error: any) {
    showResult('filesResult', { error: error.message }, true)
  }
})

console.log('OpenHub Example loaded')
