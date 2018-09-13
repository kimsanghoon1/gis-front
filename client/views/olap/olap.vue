<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent is-4" v-bind:style="{width: componentWidth + 'px'}">
        <article class="tile is-child box">
          <p style="float: right;">
            settings
            <vb-switch type="success" :checked="settings" v-model="settings"></vb-switch>
          </p>
          <h1 class="title">{{olapName}}</h1>

          <div class="block">

            <label class="label" v-if="Id != 1">차트 종류 선택</label>
            <div class="select is-fullwidth" v-if="Id != 1">
              <select v-model="chart">
                <option v-for="chart in chartList" :value="chart">{{chart}}</option>
              </select>
            </div>

              <!-- Map Start -->
              <div id="map" style="height: 500px; width: 100%;" v-if="settings == false && chart =='Map'"></div>
              <!-- Map End -->

              <!-- Pie Chart Start -->
              <div ref="pie" v-if="settings == false && chart =='Pie'"></div>
              <!-- Pie Chart End -->

              <!-- Doughnut Chart Start -->
              <div ref="doughnut" v-if="settings == false && chart == 'Doughnut'"></div>
              <!-- Doughnut Chart End -->

              <!-- Bar Chart Start -->
              <div ref="bar" v-if="settings == false && chart == 'Bar'"></div>
              <!-- Bar Chart End -->

              <!-- Table Start -->
              <div class="table-responsive" v-if="settings == false && chart == 'Data Table'">
                <table class="table is-bordered is-striped is-narrow">
                  <thead>
                  <tr>
                    <th v-for="(value,key) in tmp.values[0]" v-if="key != 'geom'"> {{key}}</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(value,key,columnIndex) in tmp.values" v-if="key != 'geom'">
                    <td v-for="(value,key,columnIndex) in value" v-if="key != 'geom'">
                      {{value}}
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <!-- Table End -->

            <div v-if="settings == true">
              <label class="label">Title Name</label>
              <p class="control">
                <input class="input" type="text" placeholder="Text input" v-model="olapName">
              </p>


              <label class="label"  v-if="Id != 1">창너비</label>
              <p class="control" v-if="Id != 1">
                <label class="radio">
                  <input type="radio" name="question" value="Small" v-model="size">
                  Small
                </label>
                <label class="radio">
                  <input type="radio" name="question" value="Medium" v-model="size">
                  Medium
                </label>
                <label class="radio">
                  <input type="radio" name="question" value="Large" v-model="size">
                  Large
                </label>
              </p>


              <!-- Schemas -->
              <label class="label">Schemas</label>
              <div class="select is-fullwidth">
                <select v-model="mode">
                  <option v-for="mode in modes" :value="mode">{{mode}}</option>
                </select>
              </div>

              <!-- Mdx Query -->
              <label class="label">MDX Query Editor</label>
              <p class="control">
                <textarea class="textarea" placeholder="Textarea" v-model="mdxQuery"></textarea>
              </p>

              <!-- Chart Select -->

              <!-- Map Color -->
              <div v-if="Id == 1" style="margin-top: 10px; margin-bottom: 10px;">
                <label class="label">맵 색상 선택</label>
                <div>
                  <v-popover
                    offset="16"
                    style="float: right"
                    placement="left-center"
                  >
                    <div style="height: 20px; width: 20px;" v-bind:style="{backgroundColor: line.maximumColors.hex}"/>

                    <template slot="popover">
                      <sketch-picker v-model="line.maximumColors"/>
                    </template>
                  </v-popover>
                  <p class="subtitle is-5">최대 :</p>
                  <!-- gradient end color -->
                  <v-popover
                    offset="16"
                    style="float: right"
                    placement="left-center"
                  >
                    <div style="height: 20px; width: 20px;" v-bind:style="{backgroundColor: line.minimumColors.hex}"/>

                    <template slot="popover">
                      <sketch-picker v-model="line.minimumColors"/>
                    </template>
                  </v-popover>
                  <p class="subtitle is-5">최소 : </p>
                </div>
              </div>

              <!-- Navigator -->
              <label class="label">Navigator</label>
              <table class="table">
                <thead>
                <tr>
                  <th>Column</th>
                </tr>
                </thead>
                <tbody>
                <div class="col-md-3">
                  <draggable element="span" v-model="columnNav"
                             v-if="columnNav != undefined"
                             :options="columnNav.length > 1 ? dragOptions : stopOptions" :move="onMove">
                    <transition-group name="no" class="list-group" tag="ul">
                      <li class="list-group-item" v-for="rows in columnNav" :key="rows">
                        <v-popover
                          offset="16"
                          placement="right-center"
                        >
                          {{ rows }}
                          <template slot="popover" v-if="rows == 'Measures'">
                            <article class="tile is-child box" v-for="name in schemas.measure.name">
                              <input type="checkbox" :value="name" v-model="selectMeasure">
                              {{ name }}
                            </article>
                          </template>
                        </v-popover>
                      </li>
                    </transition-group>
                  </draggable>
                </div>
                </tbody>
              </table>
              <table class="table">
                <thead>
                <tr>
                  <th>Rows</th>
                </tr>
                </thead>
                <tbody>

                <div class="col-md-3">
                  <draggable element="span" v-model="rowsNav" :options="rowsNav.length > 1 ? dragOptions : stopOptions"
                             v-if="rowsNav != undefined"
                             :move="onMove">
                    <transition-group name="no" class="list-group" tag="ul">
                      <li class="list-group-item" v-for="rows in rowsNav" :key="rows">
                        {{rows}}
                      </li>
                    </transition-group>
                  </draggable>
                </div>
                </tbody>
              </table>
              <table class="table">
                <thead>
                <tr>
                  <th>Filter</th>
                </tr>
                </thead>
                <tbody>
                <div class="col-md-3">
                  <draggable element="span" v-model="filterNav"
                             v-if="filterNav != undefined"
                             :options="filterNav.length > 1 ? dragOptions : stopOptions" :move="onMove">
                    <transition-group name="no" class="list-group" tag="ul">
                      <li class="list-group-item" v-for="filter in filterNav" :key="filter">
                        {{filter}}
                      </li>
                    </transition-group>
                  </draggable>
                </div>
                </tbody>
              </table>
            </div>
          </div>
          <button v-if="Id != 1" style="float: right" class="button is-danger" @click="$emit('delete-row')">삭제</button>
        </article>
      </div>
    </div>

    </div>
    <!-- setting end -->
  </div>
</template>

<script>
  /* eslint-disable */
  var Popper = require('popper.js');
  import Plotly from 'plotly.js'
  import { Tabs, TabPane } from 'vue-bulma-tabs'
  import wkx from 'wkx'
  import { Sketch } from 'vue-color'
  import draggable from 'vuedraggable'
  import xmla4js from 'xmla4js'
  import VbSwitch from 'vue-bulma-switch'
  import Cleave from 'vue-cleave'
  import 'cleave.js/dist/addons/cleave-phone.cn'
  //  import ContextMenu from 'ol-contextmenu'

  export default {
    components: {
      Tabs,
      TabPane,
      'sketch-picker': Sketch,
      draggable,
      xmla4js,
      VbSwitch,
      Cleave
    },
    computed: {
      barChartData: {
        get: function () {
          var me = this
          var result = [];

          if (me.tmp != undefined && me.chart == 'Bar') {
            var keys = Object.keys(me.tmp.values[0])
            if (keys.includes("EMD")) {
              for (var i = 0; i < me.tmp.values.length; i++) {
                var obj = {x: ['Price'], y: [me.tmp.values[i].Price], name: me.tmp.values[i].EMD, type: 'bar'}
                result.push(obj)
              }
            } else if (keys.includes("SIG")) {
              for (var i = 0; i < me.tmp.values.length; i++) {
                var obj = {x: ['Price'], y: [me.tmp.values[i].Price], name: me.tmp.values[i].SIG, type: 'bar'}
                result.push(obj)
              }
            } else if (keys.includes("SD")) {
              for (var i = 0; i < me.tmp.values.length; i++) {
                var obj = {x: ['Price'], y: [me.tmp.values[i].Price], name: me.tmp.values[i].SD, type: 'bar'}
                result.push(obj)
              }
            }
            return result
          }
        }
      },
      pieChartData: {
        get: function () {
          var me = this;

          var values = []
          var labels = []

          if (me.tmp != undefined && me.chart == 'Pie') {
            var keys = Object.keys(me.tmp.values[0])
            if (keys.includes("EMD")) {
              for (var i = 0; i < me.tmp.values.length; i++) {
                values.push(me.tmp.values[i].Price)
                labels.push(me.tmp.values[i].EMD)
              }
            } else if (keys.includes("SIG")) {
              for (var i = 0; i < me.tmp.values.length; i++) {
                values.push(me.tmp.values[i].Price)
                labels.push(me.tmp.values[i].SIG)
              }
            } else if (keys.includes("SD")) {
              for (var i = 0; i < me.tmp.values.length; i++) {
                values.push(me.tmp.values[i].Price)
                labels.push(me.tmp.values[i].SD)
              }
            }

            var result = [{
              values: values,
              labels: labels,
              type: 'pie'
            }]

            return result
          }
        }
      },
      doughnutChartData: {
        get: function () {
          var me = this
          var values = []
          var labels = []

          if (me.tmp != undefined && me.chart == 'Doughnut') {
            var keys = Object.keys(me.tmp.values[0])
            if (keys.includes("EMD")) {
              for (var i = 0; i < me.tmp.values.length; i++) {
                values.push(me.tmp.values[i].Price)
                labels.push(me.tmp.values[i].EMD)
              }
            } else if (keys.includes("SIG")) {
              for (var i = 0; i < me.tmp.values.length; i++) {
                values.push(me.tmp.values[i].Price)
                labels.push(me.tmp.values[i].SIG)
              }
            } else if (keys.includes("SD")) {
              for (var i = 0; i < me.tmp.values.length; i++) {
                values.push(me.tmp.values[i].Price)
                labels.push(me.tmp.values[i].SD)
              }
            }

            var result = [{
              values: values,
              labels: labels,
              name: 'Price',
              hoverinfo: 'label+percent+name',
              hole: 0.4,
              type: 'pie'
            }]
          }
          return result
        }
      },
      columnMdx: {
        get: function () {
          var me = this
          return me.editColumnsMdx.replace(/(^\s*)|(\s*$)/gi, "")
        },
        set: function (newVal) {
//          console.log("columnMdx: " + newVal)
        }
      },
      rowsMdx: {
        get: function () {
          var me = this
          return me.editRowsMdx.replace(/(^\s*)|(\s*$)/gi, "")
        },
        set: function (newVal) {
//          console.log("rowsMdx: " + newVal)
        }
      },
      computedMdxQuery: {
        get: function () {
          var me = this
          if (me.tmp == undefined) {
            if (me.mode == 'realestate') {
              var query = 'SELECT {[Measures].[Price]} ON COLUMNS, {[Estate].[All Estates].Children} ON ROWS FROM [Deals] WHERE [Time].[2016]'
              var columnKeyword = new RegExp('on columns', 'ig');
              var rowsKeyword = new RegExp('on rows', 'ig');

              var columnResult = query.match(columnKeyword)[0]
              var rowsResult = query.match(rowsKeyword)[0]
              //Column String , Rows String
              var columnMdx = query.substring(6, query.lastIndexOf(columnResult) - 1)
              var rowsMdxQuery = query.substring(query.lastIndexOf(columnResult) + 11, query.lastIndexOf(rowsResult) - 1)

              this.editColumnsMdx = columnMdx.replace(/(^\s*)|(\s*$)/gi, "");
              this.editRowsMdx = rowsMdxQuery.replace(/(^\s*)|(\s*$)/gi, "");

              return query

            } else if (me.mode == 'geofoodmart') {
              var query = 'SELECT {[Measures].[Unit Sales], [Measures].[Store Cost], [Measures].[Store Sales]} ON COLUMNS, {([Store].[All Stores], [Product].[All Products])} ON ROWS from [Sales] where ([Time].[1997])'
              var columnKeyword = new RegExp('on columns', 'ig');
              var rowsKeyword = new RegExp('on rows', 'ig');

              var columnResult = query.match(columnKeyword)[0]
              var rowsResult = query.match(rowsKeyword)[0]
              //Column String , Rows String
              var columnMdx = query.substring(6, query.lastIndexOf(columnResult) - 1)
              var rowsMdxQuery = query.substring(query.lastIndexOf(columnResult) + 11, query.lastIndexOf(rowsResult) - 1)

              return query
            }
          } else {

            var query = 'SELECT ' + me.columnMdx + ' ON COLUMNS, ' + me.rowsMdx + ' ON ROWS FROM [' + me.cube + '] WHERE [Time].[2016]'

            return query
          }
        },
        set: function (newVal) {
          var columnKeyword = new RegExp('on columns', 'ig');
          var rowsKeyword = new RegExp('on rows', 'ig');

          var columnResult = newVal.match(columnKeyword)[0]
          var rowsResult = newVal.match(rowsKeyword)[0]
          //Column String , Rows String
          var columnMdx = newVal.substring(6, newVal.lastIndexOf(columnResult) - 1)
          var rowsMdxQuery = newVal.substring(newVal.lastIndexOf(columnResult) + 11, newVal.lastIndexOf(rowsResult) - 1)

          this.editColumnsMdx = columnMdx;
          this.editRowsMdx = rowsMdxQuery

          me.mdxQuery = newVal
          this.$emit('update:mdxQuery', newVal)
        }
      },
      dragOptions () {
        return {
          animation: 0,
          group: 'description',
          ghostClass: 'ghost'
        }
      },
      stopOptions () {
        return {
          animation: 0,
          group: 'description',
          ghostClass: 'ghost'
        }
      },
    },
    created () {
      var me = this;
      if(me.Id == 1) {
        me.chart = 'Map'
        me.componentWidth = 900

      } else {
        me.size = 'Medium'
      }

      this.$nextTick(function () {
        me.getConnections();
        if(me.Id == 1) {
          me.drawMap()
        }
      })
    },

    watch: {
      chart: function (newVal) {
        var me = this

        this.$nextTick(() => {
          if(newVal == 'Data Table') {
           $('.plot-container').remove()
          }
          if (newVal == 'Bar') {
          Plotly.newPlot(
            me.$refs.bar,
            me.barChartData,
            {
              barmode: 'group',
              margin: {t: 0, l: 0, b: 0, r: 0}
            }
          )
        } else if (newVal == 'Pie') {
          Plotly.newPlot(
            me.$refs.pie,
            me.pieChartData,
            {
              margin: {t: 0, l: 0, b: 0, r: 0}
            }
          )
        } else if (newVal == 'Doughnut') {
          Plotly.newPlot(
            me.$refs.doughnut,
            me.doughnutChartData,
            {
              margin: {t: 0, l: 0, b: 0, r: 0}
            }
          )
        }
        })

      },
      size: function (newVal) {
        var me = this
        if (newVal == 'Small') {
          me.componentWidth = 300
        } else if (newVal == 'Medium') {
          me.componentWidth = 500
        } else if (newVal == 'Large') {
          me.componentWidth = 700
        }
      },
      componentWidth : function (newVal) {
        var me = this

        newVal = newVal*1;

        if (newVal <= me.containerWidth) {
//          console.log("component")
          if(me.beforeComponentWidth != 0) {
            this.$emit('update:componentWidth', me.beforeComponentWidth)
          } else {
            this.$emit('update:componentWidth', newVal)
          }
        }
      },
      containerWidth: function (newVal) {
        var me = this

        if(newVal < me.componentWidth) {
          newVal = newVal*1
          if(me.beforeComponentWidth == 0) {
            me.beforeComponentWidth = me.componentWidth
          }
          me.componentWidth = newVal

        }
      },
      settings: function (newVal) {
        var me = this

        if(newVal == false) {
            this.$nextTick(() => {
              if(me.chart == 'Map') {
              me.clearPolygon()
              me.drawMap()
              me.submit()
            } else {
              me.submit()
            }
          })
        }
      },
      mdxQuery: function (newVal) {
        var me = this
        console.log(newVal)
        console.log(this.computedMdxQuery)
        this.$emit('update:mdxQuery', newVal)
      },
      computedMdxQuery: function () {
//        var me = this
//        me.mdxQuery = me.computedMdxQuery
      },
      barChartData: function () {
        var me = this;
        Plotly.newPlot(
          me.$refs.bar,
          me.barChartData,
          {
            barmode: 'group',
            margin: {t: 0, l: 0, b: 0, r: 0}
          }
        )
      },
      pieChartData: function () {
        var me = this;
        Plotly.newPlot(
          me.$refs.pie,
          me.pieChartData,
          {
            margin: {t: 0, l: 0, b: 0, r: 0}
          }
        )
      },
      doughnutChartData: function () {
        var me = this
        Plotly.newPlot(
          me.$refs.doughnut,
          me.doughnutChartData,
          {
            margin: {t: 0, l: 0, b: 0, r: 0}
          }
        )
      },
      columnNav: function () {
        console.log('hi')
        if (this.columnNav.length == 0 && this.columnBack >= 1) {
          this.columnNav = this.columnBack
        }
        if (this.columnBack.length == 0) {
          this.navChange = false;
          this.columnBack = this.columnNav
        } else if (this.columnNav != this.columnBack) {
          this.navChange = true
        }

        console.log('columnNav:' , this.columnNav)
        this.$emit('update:columnNav', this.columnNav)
        this.$emit('update:filterNav', this.filterNav)
        this.$emit('update:rowsNav', this.rowsNav)
      },

      rowsNav: function () {

        if (this.rowsNav.length == 0 && this.rowsBack >= 1) {
          this.rowsNav = this.rowsBack
        }
        if (this.rowsBack.length == 0) {
          this.navChange = false;
          this.rowsBack = this.rowsNav
        } else if (this.rowsNav != this.rowsBack) {
          this.navChange = true
        }
        this.$emit('update:columnNav', this.columnNav)
        this.$emit('update:filterNav', this.filterNav)
        this.$emit('update:rowsNav', this.rowsNav)
      },
      filterNav: function () {

        if (this.filterNav.length == 0 && this.filterBack >= 1) {
          this.filterNav = this.filterBack
        }
        if (this.filterBack.length == 0) {
          this.navChange = false;
          this.filterBack = this.filterNav
        } else if (this.filterNav != this.filterBack) {
          this.navChange = true
        }
        this.$emit('update:columnNav', this.columnNav)
        this.$emit('update:filterNav', this.filterNav)
        this.$emit('update:rowsNav', this.rowsNav)
      },
      selectMeasure: function (newVal) {
        var me = this;
        var columnList = me.editColumnsMdx.replace(/\[Measures\]\.\[/gi, '').replace(/\]/gi, '').replace('{', '').replace(/ /g, "").replace('}', '').split(',')

        if (newVal.length >= columnList.length) {
          for (var i = 0; i < newVal.length; i++) {
            var addColumn = '[Measures].[' + newVal[i] + ']'

            if (!columnList.includes(newVal[i])) {
              if (me.editColumnsMdx.indexOf(newVal[i]) == -1) {
                var newColumn = me.editColumnsMdx.substring(0, me.editColumnsMdx.length - 1)
                if (newVal.length == 1) {
                  var resultColumn = newColumn + addColumn + '}'
                } else {
                  var resultColumn = newColumn + ', ' + addColumn + '}'
                }
                me.editColumnsMdx = resultColumn
              }
            }
          }
        } else {
          for (var e = 0; e < columnList.length; e++) {
            if (!newVal.includes(columnList[e])) {

              if (columnList.length == 1) {
                var deleteColumn = '[Measures].[' + columnList[e] + ']'
              } else if (e == 0) {
                var deleteColumn = '[Measures].[' + columnList[e] + '], '
              } else {
                var deleteColumn = ', [Measures].[' + columnList[e] + ']'
              }
              me.editColumnsMdx = me.editColumnsMdx.replace(deleteColumn, '')
            }
          }
        }

      },
      editColumnsMdx: function () {
        var me = this;
        var columnArray = me.editColumnsMdx.replace('{', '').replace(/ /g, "").replace('}', '').split(',')
        for (var e = 0; e < columnArray.length; e++) {
          var columnTmp = columnArray[e].split('.')
          if (columnTmp.length > 1) {
            if (columnTmp[columnTmp.length - 1].indexOf(']') != -1) {
              var columnName = columnTmp[columnTmp.length - 1].replace('[', '').replace(']', '')

              if (!me.selectMeasure.includes(columnName)) {

                me.selectMeasure.push(columnName)
              }
            }
          }
        }
        if(me.selectMeasure.length == 0 && me.schemas.measure.name.length != 0) {
          me.selectMeasure.push(me.schemas.measure.name[0])
        }
      },
      tmp: function () {
        var me = this

        if(me.chart == 'Map') {
          console.log('Map')
          me.clearPolygon()
          if(me.usedMdxQuery != me.mdxQuery) {
            me.submit()
          }
        } else if (me.chart == 'Bar') {
          Plotly.newPlot(
            me.$refs.bar,
            me.barChartData,
            {
              barmode: 'group',
              margin: {t: 0, l: 0, b: 0, r: 0}
            }
          )
        } else if (me.chart == 'Pie') {
          Plotly.newPlot(
            me.$refs.pie,
            me.pieChartData,
            {
              margin: {t: 0, l: 0, b: 0, r: 0}
            }
          )
        } else if (me.chart == 'Doughnut') {
          Plotly.newPlot(
            me.$refs.doughnut,
            me.doughnutChartData,
            {
              margin: {t: 0, l: 0, b: 0, r: 0}
            }
          )
        }
      },
      mode: function (newVal) {
        var me = this
        this.getSchemas()
        this.$emit('update:mode', newVal)
        if(me.mdxQuery == undefined) {

          this.$emit('update:mdxQuery', me.computedMdxQuery)
        }
      },
    },
    mounted () {
      var me = this
      if(me.columnNav == undefined) {
        me.columnNav = [];
        me.$emit('update:columnNav', me.columnNav)
      }
      if(me.rowsNav == undefined) {
        me.rowsNav = [];
        me.$emit('update:rowsNav', me.rowsNav)
      }
      if(me.filterNav == undefined) {
        me.filterNav = [];
        me.$emit('update:filterNav', me.filterNav)
      }
    },
    props: {
      componentWidth: Number,
      containerWidth: Number,
      Id: Number,
      mdxQuery: String,
      mode: String,
      columnNav: Array,
      rowsNav: Array,
      filterNav: Array,
      tmp: Object
    },
    data () {
      return {
//        tmp: {},
        olapName: 'New Olap',
        beforeComponentWidth: 0,
        usedMdxQuery: '',
        settings: false,
        navChange: false,
        editable: true,
        vmap: [],
        myArray: [],
        map: [],
        startPopper: false,
        endPopper: false,
        contextmenu: [],
        rowsBack: [],
        columnBack: [],
        filterBack: [],
        schemas: {
          table: {
            name: [],
            level: []
          },

          measure: {
            name: [],
          },
          dimension: {
            name: [],
            level: []
          }
        },
//        columnNav: [],
//        rowsNav: [],
//        filterNav: [],
        editRowsMdx: '',
        cube: '',
        modes: [],
        chartList: [  'Data Table', 'Pie', 'Doughnut', 'Bar'],
        sizes: ['Small', 'Medium', 'Large'],
        size: '',
        chart: '',
//        mode: '',
        address: '',
        sd: '',
        sig: '',
        dong: '',
        detailAddress: '',
        x: '',
        y: '',
        selectMeasure: [],
        selectRows: [],
        editColumnsMdx: '',
        geom: [],
        line: {
          maximumColors: {
            hex: '#194d33',
            hsl: {h: 150, s: 0.5, l: 0.2, a: 1},
            hsv: {h: 150, s: 0.66, v: 0.30, a: 1},
            rgba: {r: 25, g: 77, b: 51, a: 1},
            a: 1
          },
          minimumColors: {
            hex: '#194d33',
            hsl: {h: 150, s: 0.5, l: 0.2, a: 1},
            hsv: {h: 150, s: 0.66, v: 0.30, a: 1},
            rgba: {r: 25, g: 77, b: 51, a: 1},
            a: 1
          }
        }
      }
    },

    methods: {
      drawMap: function () {
        var me = this;

        var Base = new ol.layer.Tile({
          name: "Base",
          source: new ol.source.XYZ({
            url: 'http://api.vworld.kr/req/wmts/1.0.0/D01A2D82-B1E6-3340-84D4-462002F06506/Base/{z}/{y}/{x}.png'
          })
        });
        var olView = new ol.View({
          center: ol.proj.transform([127.100616, 37.402142], 'EPSG:4326', 'EPSG:3857'),//좌표계 변환
          zoom: 6
        })
        me.map = new ol.Map({
          layers: [Base],
          target: 'map',
          view: olView,
          controls: ol.control.defaults({
            attributionOptions: {
              collapsible: false
            }
          }),
        });
        var contextmenu = new ContextMenu({
          width: 170,
          defaultItems: true, // defaultItems are (for now) Zoom In/Zoom Out
          items: [
            {
              text: 'Roll Up',
              classname: 'some-style-class', // add some CSS rules
              callback: me.rollUp // `center` is your callback function
            },
            {
              text: 'Drill Down',
              classname: 'some-style-class', // you can add this icon with a CSS class
                                             // instead of `icon` property (see next line)
//            icon: 'img/marker.png',  // this can be relative or absolute
              callback: me.drillDown
            },
            '-' // this is a separator
          ]
        });

        me.map.addControl(contextmenu);
        me.map.getViewport().addEventListener('contextmenu', function (evt) {
          evt.preventDefault();

          me.x = ol.proj.toLonLat(me.map.getEventCoordinate(evt))[0]
          me.y = ol.proj.toLonLat(me.map.getEventCoordinate(evt))[1]
        })

        contextmenu.on('beforeopen', function (evt) {
          var feature = me.map.forEachFeatureAtPixel(evt.pixel, function (ft, l) {
            return ft;
          });

          if (feature) { // open only on features
            contextmenu.enable();
          } else {
            contextmenu.disable();
          }
        });
      },
      onLayoutUpdate (evt) {
        this.layout = evt.layout
      },
      navChanged: function () {
        this.columnBack = this.columnNav;
        this.rowsBack = this.rowsNav;
        this.filterBack = this.filterNav;
        this.navChange = false;
      },
      navBack: function () {
        this.columnNav = this.columnBack;
        this.rowsNav = this.rowsBack;
        this.filterNav = this.filterBack;
        this.navChange = false;
      },
      onMove ({relatedContext, draggedContext}) {
        const relatedElement = relatedContext.element;
        const draggedElement = draggedContext.element;
//        return (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      },
      getConnections: function () {
        var me = this
        $.ajax({
          type: "GET",
          url: 'http://localhost:8080/getConnections',
          contentType: "application/json; charset=UTF-8",
          success: function (data) {
            for (var key in data) {
              me.modes.push(key)
            }
          }
        });
      },

      getSchemas: function () {
        var me = this
        me.selectMeasure = [];
        me.schemas.table.name = [];
        me.schemas.dimension.name = [];
        me.schemas.dimension.level = [];
        me.schemas.measure.name = [];

        $.ajax({
          type: "GET",
          url: 'http://localhost:8080/getSchema?connectionName=' + me.mode,
          contentType: "application/xml; charset=UTF-8",
          success: function (xml) {
            var schema = $(xml).find('Schema');
            var cube = schema.children()
            me.cube = cube[0].getAttribute('name')
            var cubeList = [];
            var table = [];
            var dimension = [];
            var measure = [];

            for (var i = 0; i < cube.children().length; i++) {
              cubeList.push(cube.children()[i].tagName)
            }
            var uniqCubeList = cubeList.reduce(function (a, b) {
              if (a.indexOf(b) < 0)a.push(b);
              return a;
            }, []);

            function typeCheck(cube) {
              if (cube.children(uniqCubeList[e])[0].tagName == "Table") {
                if (cube.children(uniqCubeList[e]).length == 1) {
                  var val = cube.children(uniqCubeList[e]).attr('name')
                  me.schemas.table.name.push(val)
                } else {
                  for (var y = 0; y < cube.children(uniqCubeList[e]).length; y++) {
                    var val = cube.children(uniqCubeList[e])[y].getAttribute('name')
                    me.schemas.table.name.push(val)
                  }
                }
              } else if (cube.children(uniqCubeList[e])[0].tagName == "Dimension") {
                if (cube.children(uniqCubeList[e]).length == 1) {
                  var val = cube.children(uniqCubeList[e]).attr('name')
                  me.schemas.dimension.name.push(val)
                } else {
                  for (var y = 0; y < cube.children(uniqCubeList[e]).length; y++) {
                    var val = cube.children(uniqCubeList[e])[y].getAttribute('name')
                    me.schemas.dimension.name.push(val)
                  }
                }
              } else if (cube.children(uniqCubeList[e])[0].tagName == "Measure") {
                if (cube.children(uniqCubeList[e]).length == 1) {
                  var val = cube.children(uniqCubeList[e]).attr('name')
                  me.schemas.measure.name.push(val)
                } else {
                  for (var y = 0; y < cube.children(uniqCubeList[e]).length; y++) {
                    var val = cube.children(uniqCubeList[e])[y].getAttribute('name')
                    me.schemas.measure.name.push(val)
                  }
                }
              }
            }

            for (var e = 0; e < uniqCubeList.length; e++) {
              if (cube.children(uniqCubeList[e]).children().length == 0) {
                typeCheck(cube)
              } else {
                if (cube.children(uniqCubeList[e]).length != 0) {
                  //ToDo : Dimension 별로 나눠줘야함.
                  for (var x = 0; x < cube.children(uniqCubeList[e]).length; x++) {
                    var dimension = $(cube.children(uniqCubeList[e])[x])
                    var dimensionName = cube.children(uniqCubeList[e])[x].getAttribute('name')

                    if (dimension.children().length == 1) {
                      var tagObj = []
                      me.schemas.dimension.name.push(dimensionName)
                      var hierarchy = $(dimension.children()[0]).children()
                      if (hierarchy.length > 0) {
                        for (var z = 0; z < hierarchy.length; z++) {
                          if (hierarchy[z].tagName == 'Level') {
                            var levelObj = {};
                            var levelKey = dimensionName;
                            levelObj[levelKey] = hierarchy[z].getAttribute('name')
                            tagObj.push(levelObj);
                          }
                        }
                        me.schemas.dimension.level.push(tagObj)
                      }

                    } else {
                      me.schemas.dimension.name.push(dimensionName)
                    }
                  }
                }
              }
            }
          }
        });
      },
      rollUp: function () {
        var me = this
        var locationObj = []
        if (me.tmp.values[0].EMD != null) {
          me.editRowsMdx = '{[' + me.rowsNav[0] + '].[All ' + me.rowsNav[0] + 's].[' + me.sd + '].Children}'
          me.mdxQuery = me.computedMdxQuery
          me.submit()
        } else if (me.tmp.values[0].SIG != null) {
          me.editRowsMdx = '{[' + me.rowsNav[0] + '].[All ' + me.rowsNav[0] + 's].Children}'
          me.mdxQuery = me.computedMdxQuery
          me.submit()
        } else if (me.tmp.values[0].SD != null) {
        }
      },
      drillDown: function () {
        var me = this;

        console.log(me.mdxQuery)

        me.getAddress().then(function () {
          var locationObj = []
          if (me.tmp.values[0].EMD != null) {
            me.editRowsMdx = '{[' + me.rowsNav[0] + '].[All ' + me.rowsNav[0] + 's].[' + me.sd + '].[' + me.sig + '].[' + me.emd + '].Children}'
            me.mdxQuery = me.computedMdxQuery
            me.submit()
          } else if (me.tmp.values[0].SIG != null) {
            me.editRowsMdx = '{[' + me.rowsNav[0] + '].[All ' + me.rowsNav[0] + 's].[' + me.sd + '].[' + me.sig + '].Children}'
            me.mdxQuery = me.computedMdxQuery
            me.submit()
          } else if (me.tmp.values[0].SD != null) {
            me.editRowsMdx = '{[' + me.rowsNav[0] + '].[All ' + me.rowsNav[0] + 's].[' + me.sd + '].Children}'
            me.mdxQuery = me.computedMdxQuery
            me.submit()
          }
        })
      },

      submit: function () {
        var me = this;
        var resultDataList = {}
        me.usedMdxQuery = me.mdxQuery

        if(me.chart == 'Map') {
          me.clearPolygon();
        }

        var mdx = me.mdxQuery

        me.$emit('update:mode', me.mode)
        me.$emit('update:mdxQuery', me.mdxQuery)

        me.tmp = {};

        me.callMdx().then(function () {
          me.$emit('update:tmp', me.tmp)

          var tmpPrice = [];
          for (var i = 0; i < me.tmp.values.length; i++) {
            tmpPrice.push(me.tmp.values[i].Price)
          }
          var minData = Math.min.apply(null, tmpPrice);
          var maxData = Math.max.apply(null, tmpPrice);

          for (var e = 0; e < me.tmp.values.length; e++) {
            if (me.tmp.values[e].EMD != undefined) {
              var sortKey = me.tmp.values[e].EMD
              if (me.tmp.values.length > 1) {
                var sortValue = me.sortData(minData, maxData, me.tmp.values[e].Price, me.tmp.values[e].EMD)
                resultDataList[sortKey] = sortValue
              } else {
                resultDataList[sortKey] = 1
              }
            } else if (me.tmp.values[e].SIG != undefined) {
              var sortKey = me.tmp.values[e].SIG
              if (me.tmp.values.length > 1) {
                var sortValue = me.sortData(minData, maxData, me.tmp.values[e].Price, me.tmp.values[e].SIG)
                resultDataList[sortKey] = sortValue
              } else {
                resultDataList[sortKey] = 1
              }
            } else if (me.tmp.values[e].SD != undefined) {
              var sortKey = me.tmp.values[e].SD
              if (me.tmp.values.length > 1) {
                var sortValue = me.sortData(minData, maxData, me.tmp.values[e].Price, me.tmp.values[e].SD)
                resultDataList[sortKey] = sortValue
              } else {
                resultDataList[sortKey] = 1
              }
            }
          }
          me.callGeo(me.tmp, resultDataList)

          // Filter => Measure 와 Rows에 사용되지 않은 나머지 부분을 넣어줌
          me.rowsNav = []
          me.columnNav = []
          me.filterNav = []
          var columnKeyword = new RegExp('on columns', 'ig');
          var rowsKeyword = new RegExp('on rows', 'ig');

          var columnResult = mdx.match(columnKeyword)[0]
          var rowsResult = mdx.match(rowsKeyword)[0]
          //Column String , Rows String
          var columnMdx = mdx.substring(6, mdx.lastIndexOf(columnResult) - 1)
          var rowsMdxQuery = mdx.substring(mdx.lastIndexOf(columnResult) + 11, mdx.lastIndexOf(rowsResult) - 1)

          columnMdx = columnMdx.replace('{', '');
          columnMdx = columnMdx.replace('}', '');
          var listColumn = columnMdx.split(',')
          for (var c = 0; c < listColumn.length; c++) {
            var listColumn2 = listColumn[c].split('.')
            if (!me.columnNav.includes(listColumn2[0].replace('[', '').replace(']', '').replace(/ /g, ""))) {
              me.columnNav.push(listColumn2[0].replace('[', '').replace(']', '').replace(/ /g, ""))
            }
          }

          me.$emit('update:columnNav', me.columnNav)

          rowsMdxQuery = rowsMdxQuery.replace('{', '');
          rowsMdxQuery = rowsMdxQuery.replace('}', '');
          rowsMdxQuery = rowsMdxQuery.replace('(', '');
          rowsMdxQuery = rowsMdxQuery.replace(')', '');
          var listRows = rowsMdxQuery.split(',')
          for (var r = 0; r < listRows.length; r++) {
            var listRows2 = listRows[r].split('.')
            if (listRows2[0].indexOf('Union') != -1) {
              var rowsName = listRows2[0].substring(listRows2[0].indexOf('['), listRows2[0].length).replace('[', '').replace(']', '').replace(/ /g, "")
              if (!me.rowsNav.includes(rowsName)) {
                me.rowsNav.push(rowsName)
              }
            } else {
              var rowsName = listRows2[0].replace('[', '').replace(']', '').replace(/ /g, "")
              if (!me.rowsNav.includes(rowsName)) {
                me.rowsNav.push(rowsName)
              }
            }
          }
          me.$emit('update:rowsNav', me.rowsNav)


          if (mdx.lastIndexOf("WHERE") != -1) {
            var whereMdx = mdx.substring(mdx.lastIndexOf("WHERE"), mdx.length)
            if (whereMdx.indexOf('(') != -1) {

            } else {
              whereMdx = whereMdx.replace('WHERE', '')
              var whereArray = whereMdx.split('.')
              var whereFilter = whereArray[0].toString().replace('[', '')
              whereFilter = whereFilter.replace(']', '')
              var whereFilterExp = whereFilter.replace(/ /g, "");

              me.filterNav.push(whereFilterExp)

            }
          } else if (mdx.indexOf("where") != -1) {
            var whereMdx = mdx.substring(mdx.lastIndexOf("where"), mdx.length)
            if (whereMdx.indexOf('(') != -1) {
              whereMdx = whereMdx.replace('where', '')
              var whereArray = whereMdx.split(',')
              for (var g = 0; g < whereArray.length; g++) {
                var whereArray2 = whereArray[g].split('.')
                var whereFilter = whereArray2[0].toString().replace('[', '')

                whereFilter = whereFilter.replace(']', '')
                whereFilter = whereFilter.replace('(', '')
                whereFilter = whereFilter.replace(')', '')
                var whereFilterExp = whereFilter.replace(/ /g, "");

                me.filterNav.push(whereFilterExp)
              }
            } else {
              whereMdx = whereMdx.replace('where', '')
              var whereArray = whereMdx.split('.')
              var whereFilter = whereArray[0].toString().replace('[', '')
              whereFilter = whereFilter.replace(']', '');
              var whereFilterExp = whereFilter.replace(/ /g, "");
              me.filterNav.push(whereFilterExp)
            }
          }

          me.$emit('update:filterNav', me.filterNav)
          for (var t = 0; t < me.schemas.dimension.name.length; t++) {
            if (me.columnNav.indexOf(me.schemas.dimension.name[t]) == -1 && me.rowsNav.indexOf(me.schemas.dimension.name[t]) == -1 && me.filterNav.indexOf(me.schemas.dimension.name[t]) == -1) {
              me.filterNav.push(me.schemas.dimension.name[t])
            }
          }
        })
      },
      callMdx: function () {
        var me = this
        return new Promise(function (resolve, reject) {

          $.ajax({
            type: "post",
            url: 'http://localhost:8080/query',
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify({
              'connectionName': me.mode,
              'query': me.mdxQuery,
              'tidy': {
                'enabled': true,
                'simplifyNames': true
              }
            }),
            success: function (data) {
              me.tmp = data;
              resolve(data);
            }
          });
        })
      },
      callGeo: function (MDXdata, resultDataList) {
        var me = this;

        for (var i = 0; i < MDXdata.values.length; i++) {

          if (MDXdata.values[i].EMD != null) {

            var url = 'http://localhost:8080/emdgeo/search/findByGeometry?signam=' + MDXdata.values[i].SIG + '&emdnam=' + MDXdata.values[i].EMD;
            $.ajax({
              type: "get",
              url: url,
              contentType: "application/hal+json; charset=UTF-8",
              success: function (data) {
                var emd_kor_na = data._embedded.emdgeo[0].emdKorName
                var geoData = data._embedded.emdgeo[0].geom
                var convertData = me.convertGeom(geoData)

                if(me.chart == 'Map') {
                  me.drawPolygon(convertData, resultDataList[emd_kor_na])
                }
              }
            });
          } else if (MDXdata.values[i].SIG != null) {

            var url = 'http://localhost:8080/siggeo/search/findByGeometry?sdnam=' + MDXdata.values[i].SD + '&signam=' + MDXdata.values[i].SIG;
            $.ajax({
              type: "get",
              url: url,
              contentType: "application/hal+json; charset=UTF-8",
              success: function (data) {
                var sig_kor_na = data._embedded.siggeo[0].sig_kor_na
                var geoData = data._embedded.siggeo[0].geom
                var convertData = me.convertGeom(geoData)

                if(me.chart == 'Map') {
                  me.drawPolygon(convertData, resultDataList[sig_kor_na])
                }
              }
            });
          } else if (MDXdata.values[i].SIG == null && MDXdata.values[i].EMD == null && MDXdata.values[i].SD) {
            var url = 'http://localhost:8080/sdgeo/search/findBySdKorName?name=' + MDXdata.values[i].SD
            $.ajax({
              type: "get",
              url: url,
              contentType: "application/hal+json; charset=UTF-8",
              success: function (data) {

                var sd_kor_na = data._embedded.sdgeo[0].sdKorName
                var geoData = data._embedded.sdgeo[0].geom
                var convertData = me.convertGeom(geoData)

                if(me.chart == 'Map') {
                  me.drawPolygon(convertData, resultDataList[sd_kor_na])
                }
              }
            });
          }
        }
      }
      ,
      convertGeom: function (wkb) {
        var me = this;
        var Buffer = require('buffer').Buffer;
        var wkx = require('wkx');

        var wkbBuffer = new Buffer(wkb, 'hex');
        var geometry = wkx.Geometry.parse(wkbBuffer);

        return geometry.toWkt()

      }
      ,
      sortData: function (minData, maxData, thisData, geo) {
        var me = this
        //300 200 - 100 --> 가격 - 최저가격 / 최고가격 - 최저가격 = >

        var resultData = (thisData - minData) / (maxData - minData)
        return resultData
      },
      getAddress: function () {
        var me = this
        return new Promise(function (resolve, reject) {
          $.ajax({
            type: "get",
            url: 'http://api.vworld.kr/req/address?service=address&request=GetAddress&key=D01A2D82-B1E6-3340-84D4-462002F06506&format=json&point=' + me.x + ',' + me.y + '&type=both',
            dataType: "jsonp",
            jsonp: "callback",
            contentType: "text/json;charset=UTF-8",
            success: function (data) {
              var result = data.response.result[0];
              me.address = result.text;
              me.sd = result.structure.level1;
              me.sig = result.structure.level2;
              me.emd = result.structure.level4L;
              me.detailAddress = result.structure.level5;

              resolve()
            }
          })
        });
      },
      multiDraw: function (coordinates) {
        // Coordinates 의 형태 [ [x,y] ]
        var me = this;
        for (var i = 0; i < me.coordinates.length; i++) {
          me.drawPolygon(me.coordinates[i].geometry)
        }

      },
      colorMath: function (returnData, color) {
        var me = this;

        //0~1  ==> 색범위, (레드맥심 - 레드미니) * 0~1 + 레드 미니 => 레드
        if (color == 'red') {
          var red = (me.line.maximumColors.rgba.r - me.line.minimumColors.rgba.r) * returnData + me.line.minimumColors.rgba.r
          return red
        } else if (color == 'green') {
          var green = (me.line.maximumColors.rgba.g - me.line.minimumColors.rgba.g) * returnData + me.line.minimumColors.rgba.g
          return green
        } else if (color == 'blue') {
          var blue = (me.line.maximumColors.rgba.b - me.line.minimumColors.rgba.b) * returnData + me.line.minimumColors.rgba.b
          return blue
        }
      },

      clearPolygon: function () {
        var me = this
        let vectorLayerArray = new Array();
        me.map.getLayers().getArray().some(function (layer, i, array) {
          if (layer instanceof ol.layer.Vector) {
            vectorLayerArray.push(layer);
          }
        }, this);

        for (var i = 0; i < vectorLayerArray.length; i++) {
          me.map.removeLayer(vectorLayerArray[i]);
        }
      },

      drawPolygon: function (coordinates, resultData) {

        var me = this;
        var wkt = coordinates
        var format = new ol.format.WKT();

        if (resultData == 0) {
          var red = me.line.minimumColors.rgba.r
          var green = me.line.minimumColors.rgba.g
          var blue = me.line.minimumColors.rgba.b
        } else if (resultData == 1) {
          var red = me.line.maximumColors.rgba.r
          var green = me.line.maximumColors.rgba.g
          var blue = me.line.maximumColors.rgba.b
        } else {
          var red = me.colorMath(resultData, 'red')
          var green = me.colorMath(resultData, 'green')
          var blue = me.colorMath(resultData, 'blue')
        }

        var feature = format.readFeature(wkt, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });

        var styles = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'rgba(' + red + ',' + green + ',' + blue + ', 1)',
            width: '2'
          }),
          fill: new ol.style.Fill({
            color: 'rgba(' + red + ',' + green + ',' + blue + ', 0.2)',
          })
        })

        var vector = new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [feature],
          }),
          style: styles

        });

        me.map.addLayer(vector);

      }
    }
  }
</script>

<style scoped>
  .context_menu {
    background-color: white;
    border: 1px solid gray;
  }

  .demo-box {
    width: 100%;
    height: 100%;
  }

  .card {
    position: relative;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: border-box;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 0.25rem;
  }

  .card-header {
    padding: 0.75rem 1.25rem;
    margin-bottom: 0;
    background-color: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  }

  .card-body {
    -webkit-box-flex: 1;
    -ms-flex: 1 1 auto;
    flex: 1 1 auto;
    padding: 1.25rem;
  }

  div.ol-overlaycontainer-stopevent {
    display: none !important;
  }

  .context_menu_item {
    padding: 3px 6px;
  }

  .context_menu_item:hover {
    background-color: #CCCCCC;
  }

  .context_menu_separator {
    background-color: gray;
    height: 1px;
    margin: 0;
    padding: 0;
  }

  #clearDirectionsItem, #getDirectionsItem {
    display: none;
  }

  /*	end styles for the ContextMenu	*/

  #map_container {
    height: 100%;
  }

  .popover-inner {
    background: #f9f9f9;
    color: black;
    padding: 24px;
    border-radius: 5px;
    box-shadow: 0 5px 30px rgba(0, 0, 0, .1);
  }

  .popover .popover-arrow {
    border-color: #f9f9f9;
  }

  .flip-list-move {
    transition: transform 0.5s;
  }

  .no-move {
    transition: transform 0s;
  }

  .ghost {
    opacity: .5;
    background: #C8EBFB;
  }

  .list-group {
    min-height: 20px;
  }

  .list-group-item {
    cursor: move;
  }

  .list-group-item i {
    cursor: pointer;
  }


</style>
