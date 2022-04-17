<template>
    <div>
        <h1 class="text-3xl">
            You are viewing the Blog page.
        </h1>
        <div class="mt-6">
            Read our articles:
            <ul class="ml-4">
                <li>
                    <router-link to="/blog/welcome-to-our-blog" class="hover:underline">Welcome to our blog</router-link>
                </li>
                <li>
                    <router-link to="/blog/our-new-website" class="hover:underline">Our new website</router-link>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        
    })
</script>