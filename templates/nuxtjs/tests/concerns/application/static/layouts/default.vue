<template>
    <div class="mx-auto w-full max-w-md min-h-screen flex items-center justify-center">
        <div>
            <Logo />
            <div class="mt-6">
                Go to:
                <ul class="ml-4">
                    <li>
                        <router-link to="/" class="hover:underline">Home page</router-link>
                    </li>
                    <li>
                        <router-link to="/blog" class="hover:underline">Blog page</router-link>
                    </li>
                </ul>
            </div>
            <Nuxt class="mt-6"/>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        
    })
</script>