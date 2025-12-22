<template>
  <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
    <h2>Users</h2>
    
    <div style="margin-bottom: 20px;">
      <input 
        v-model="newUser.name" 
        placeholder="Name" 
        style="margin-right: 10px; padding: 5px;"
      />
      <input 
        v-model="newUser.email" 
        placeholder="Email" 
        style="margin-right: 10px; padding: 5px;"
      />
      <button 
        @click="addUser" 
        :disabled="adding || !newUser.name || !newUser.email"
        style="padding: 5px 15px; cursor: pointer;"
      >
        {{ adding ? 'Adding...' : 'Add User' }}
      </button>
    </div>

    <div v-if="usersLoading">Loading users...</div>
    <div v-else-if="usersError" style="color: red;">Error: {{ usersError }}</div>
    <ul v-else-if="users?.length" style="list-style: none; padding: 0;">
      <li v-for="user in users" :key="user.id" style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>{{ user.name }}</strong> ({{ user.email }})
      </li>
    </ul>
    <p v-else>No users found</p>

    <h2 style="margin-top: 40px;">Session</h2>
    <div v-if="sessionLoading">Loading session...</div>
    <div v-else-if="sessionError" style="color: red;">Error: {{ sessionError }}</div>
    <p v-else-if="session">Session ID: {{ session }}</p>
    <p v-else>No active session</p>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

const newUser = ref({ name: '', email: '' })
const adding = ref(false)

const { data: users, error: usersError, pending: usersLoading, refresh: refreshUsers } = await useFetch<User[]>('/api/users', {
  server: true,
  lazy: false
})

const { data: session, error: sessionError, pending: sessionLoading } = await useFetch<string>('/api/sessions', {
  server: true,
  lazy: false
})

async function addUser() {
  if (!newUser.value.name || !newUser.value.email) return
  
  adding.value = true
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: {
        name: newUser.value.name,
        email: newUser.value.email
      }
    })
    
    // Clear form
    newUser.value = { name: '', email: '' }
    
    // Refresh users list
    await refreshUsers()
  } catch (error) {
    console.error('Failed to add user:', error)
    alert('Failed to add user: ' + (error as Error).message)
  } finally {
    adding.value = false
  }
}
</script>