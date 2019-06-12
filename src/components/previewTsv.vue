<template>
  <div class="container">
    <div
      v-for="(row, rIdx) in arrOfArr"
      :key="rIdx"
      class="row">
      <div
        v-for="(cell, cIdx) in row"
        :key="cIdx"
        :style="cellStyle"
        class="col-sm text-nowrap overflow-hidden">
        {{ cell }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    tsv: {
      type: String
    }
  },
  computed: {
    arrOfArr: function () {
      return this.tsv.split('\n').map(row => row.split('\t'))
    },
    cellStyle: function () {
      return {
        maxWidth: `${Math.floor(100 / this.arrOfArr[0].length)}%`
      }
    }
  }
}
</script>
<style scoped>

</style>
