<template>
  <div>测试(vue2){{ time }}</div>
</template>

<script>

export default {
  name: 'Vue2TestDemo',
  data() {
    return {
      time: Date.now()
    }
  }
}
</script>