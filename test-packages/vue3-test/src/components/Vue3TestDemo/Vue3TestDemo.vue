<template>
  <div>测试(vue3){{ time }}</div>
</template>

<script>

export default {
  name: 'Vue3TestDemo',
  date() {
    return {
      time: Date.now()
    }
  }
}
</script>