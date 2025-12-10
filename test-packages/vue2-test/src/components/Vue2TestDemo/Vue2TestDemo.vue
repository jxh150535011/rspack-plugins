<template>
  <div class="vue2-test">
    测试(vue2){{ time }}
    <input v-model="value"></input>
  </div>
</template>

<script>
import './styles.less';
export default {
  name: 'Vue2TestDemo',
  data() {
    return {
      time: Date.now(),
      value
    }
  }
}
</script>

<style lang="less" scoped>
  .vue2-test {

  }
</style>