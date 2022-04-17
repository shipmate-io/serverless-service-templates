<template>
    <div>
        <h1 class="text-3xl">
            You are viewing the Home page.
        </h1>
        <p class="mt-6">
            The application key is: {{ key }}
        </p>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        computed: {
            key() {
                return process.env.NUXT_ENV_APP_KEY
            }
        }
    })
</script>