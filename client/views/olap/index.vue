<template>
  <div v-bind:style="{ height: containerHeight + 'px' }">
    <div class="md-layout md-gutter">
      <div class="md-layout-item md-layout">
        <olap v-on:delete-row="deleteThisRow(index)"
              :componentWidth.sync="items[0].size"
              :containerWidth="containerWidth"
              :Id="items[0].id"
              :mode.sync="mode"
              :tmp.sync="tmp"
              :mdxQuery.sync="mdxQuery"
              :columnNav.sync="columnNav"
              :filterNav.sync="filterNav"
              :rowsNav.sync="rowsNav"
        >
        </olap>
      </div>
      <div class="md-layout-item md-layout">
        <div class="md-layout-item md-medium-size-33 md-small-size-50 md-xsmall-size-100" v-for="(item, index) in items"   :key="item.id" v-if="index != 0">
          <olap v-on:delete-row="deleteThisRow(index)"
                :componentWidth.sync="item.size"
                :containerWidth="containerWidth"
                :Id="item.id"
                :mode.sync="mode"
                :tmp.sync="tmp"
                :mdxQuery.sync="mdxQuery"
                :columnNav.sync="columnNav"
                :filterNav.sync="filterNav"
                :rowsNav.sync="rowsNav"
          >
          </olap>
        </div>
        <div style="height: 200px; width: 200px; cursor: pointer; margin: 10px;" @click="addItem"> <img src="../../assets/plus.png" /> </div>
      </div>
    </div>
  </div>
</template>

<script>
  /* eslint-disable */

  import Olap from './olap.vue'
  import { MdLayout } from 'vue-material'
  import 'vue-material/dist/vue-material.min.css'

  export default {
    components: {
      'olap': Olap,
      MdLayout
    },
    props: {
      componentWidth : Number,
      mdxQuery: String,
      mode: String,
      columnNav: Array,
      rowsNav: Array,
      filterNav: Array,
      tmp: Object
    },
    computed: {

    },
    created () {
      var me = this
      if(me.tmp != undefined) {
        me.tmp = {}
      }
    },

    watch: {
      containerHeight(newHeight, oldHeight) {
        var me = this
        me.containerHeight = newHeight;
      },

    },
    mounted () {
      var me = this
      this.$nextTick(() => {
        window.addEventListener('resize', () => {
        me.containerHeight = $('.slideInLeft').height();
        me.containerWidth = $('.app-content').width();
         });
      })
      me.containerHeight = $('.slideInLeft').height()
      me.containerWidth = $('.app-content').width();
    },

    data () {

      return {
        items: [
          {
            id: 1,
            size: 900,
          },
        ],
        containerHeight: 0,
        containerWidth: 0,
        selected: null,
        mdxQuery : '',

      }
    },

    methods: {
      addItem: function () {
        var me = this;
        var newId = me.items.length + 1
        var newItem = { id: newId, size: 300 }
        me.items.push(newItem)
      },
      deleteThisRow: function(index) {
        var me = this
        me.items.splice(index, 1);
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
<style scoped>



</style>
