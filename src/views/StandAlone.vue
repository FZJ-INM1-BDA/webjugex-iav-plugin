<template>
<div class="container">
  <div class="row d-flex justify-content-center">
    <div class="mt-5 col-sm-12 col-md-6">

      <!-- card  -->
      <md-card>
        
        <!-- header  -->
        <md-card-header>
          <span class="md-title">
            webJuGEx Past Analysis
          </span>
        </md-card-header>

        <!-- content -->
        <md-card-content>
          <PastAnalysis
            ref="pastAnalysis"
            class="h-0 invisible" />

          <md-list :md-expand-single="true">
            <md-list-item>
              test
            </md-list-item>
          </md-list>
        </md-card-content>

      </md-card>
    </div>
  </div>
</div>
</template>
<script>
import PastAnalysis from '../components/PastAnalysis'
export default {
  components: {
    PastAnalysis
  },
  data: function () {
    return {

    }
  },
  methods: {
    /**
     * TODO implement rename
     */
    getNewName: function () {
      return new Promise((rs, rj) => {

      })
    }
  }
}
</script>
<style scoped>
.h-0
{
  height: 0!important;
}
</style>