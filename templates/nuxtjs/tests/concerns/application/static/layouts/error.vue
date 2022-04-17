<template>
  <div>
        <h1 v-if="error.statusCode === 404" class="text-3xl">This page could not be found.</h1>
        <h1 v-else class="text-3xl">An error occurred.</h1>
  </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        props: ['error']
    })
</script>