<template>
  <div class="bg-dark p-2">
    <small v-if="descReadmore">
      <p>
        Find a set of differentially expressed genes between two user defined volumes of interest based on JuBrain maps.
      </p>
      <p>
        The tool downloads expression values of user specified sets of genes from Allen Brain API<sup>[1]</sup>.
      </p>
      <p>
        Then, it uses zscores to find which genes are expressed differentially between the user specified regions of interests.
      </p>
      <p>
        After the analysis is finished, the genes and their calculated p values are displayed. There is also an option of downloading the gene names and their p values and the roi coordinates used in the analysis.
      </p>
      <p>
        <sup>[1]</sup> &copy; 2015 Allen Institute for Brain Science. Allen Brain Atlas API. Available from: <a target = "_blank" href = "brain-map.org/api/index.html">brain-map.org/api/index.html</a>
      </p>
      <a @click.prevent="descReadmore = false" href="#"> readless </a>
    </small>
    <small v-else>
      <p>
        Find a set of differentially expressed genes between two user defined volumes of interest ... 
        <a @click.prevent="descReadmore = true" href="#"> readmore </a>
      </p>
    </small>
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      descReadmore: false
    }
  }
}
</script>
<style>
  
</style>