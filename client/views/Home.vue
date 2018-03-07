<template>
  <div class="content has-text-centered">
    <p>
      <img width="200" src="~assets/new_logo_color.png" :alt="description">
    </p>
  </div>
</template>

<script>
export default {

  data () {
    return this.$store.state.pkg
  }

}
</script>

<style lang="scss" scoped>
.is-title {
  text-transform: capitalize;
}
</style>
