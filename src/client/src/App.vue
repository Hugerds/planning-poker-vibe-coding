<template>
  <div id="app" class="app-container">
    <router-view />
  </div>
</template>

<script setup>
// No script setup needed for now
</script>

<style scoped>
.app-container {
  max-width: 1140px; /* Exemplo de max-width, conforme especificação */
  margin: 0 auto; /* Centraliza o container */
  padding: var(--spacing-md); /* Adiciona padding geral, bom para mobile */
}
</style>