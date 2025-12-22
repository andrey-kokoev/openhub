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
const { data: users } = await useFetch('/api/users')
const { data: session } = await useFetch('/api/session')
</script>