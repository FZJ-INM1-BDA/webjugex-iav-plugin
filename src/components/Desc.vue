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
        <sup>[1]</sup> For retrieving microarray data, brainscapes connects to the web API of the Allen Brain Atlas (© 2015 Allen Institute for Brain Science), available from <a href="https://brain-map.org/api/index.html">https://brain-map.org/api/index.html</a>. Any use of the microarray data needs to be in accordance with their terms of use, as specified at <a href="https://alleninstitute.org/legal/terms-use/">https://alleninstitute.org/legal/terms-use/</a>.
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