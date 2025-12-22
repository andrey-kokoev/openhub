<template>
  <div>
    <h2>Users</h2>
    <ul v-if="users?.length">
      <li v-for="user in users" :key="user.id">
        {{ user.name }} ({{ user.email }})
      </li>
    </ul>
    <p v-else>No users found</p>

    <h2>Session</h2>
    <p v-if="session">Session ID: {{ session }}</p>
    <p v-else>No active session</p>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

const { data: users } = await useFetch<User[]>('/api/users')
const { data: session } = await useFetch<string>('/api/sessions')
</script>