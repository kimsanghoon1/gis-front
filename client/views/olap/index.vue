<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
          <h4 class="title">Map</h4>
          <div ref="map"></div>

          <p style="margin-top: 20px; margin-bottom: 20px;">
            <a class="button is-info is-outlined">전북 - 드릴다운</a>
            <a class="button is-info is-outlined">전북 남원 - 롤업</a>
            <a class="button is-info is-outlined">울산 - 드릴다운</a>
            <a class="button is-info is-outlined">울산 울주군 - 롤업</a>
          </p>
          <label class="label">MDX query editor</label>
          <p class="control">
            <textarea class="textarea" placeholder="Textarea"></textarea>
          </p>
          <div align="right">
            <p align="right">
              <button class="button is-primary">Submit</button>
            </p>
          </div>
        </article>
      </div>
      <div style="margin-top: 10px;">
        <article class="tile is-child box" style="margin-bottom: 10px;">
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="selected.mode">
                <option v-for="mode in modes" :value="mode">{{mode}}</option>
              </select>
            </div>
          </div>
        </article>
        <div class="is-info" style="margin-top: 10px;">
          <article class="tile is-child box">
            <p class="title is-3">세부정보</p>
          </article>
          <article class="tile is-child box">
            <p class="subtitle is-5">member: </p>
            <p class="subtitle is-5">Cell value: </p>
            <p class="subtitle is-5">Ordinals: </p>
            <p class="subtitle is-6">Axis: </p>
            <p class="subtitle is-6">Position: </p>
            <p class="subtitle is-6">Member: </p>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Plotly from 'plotly.js'


  export default {

    created () {
      this.fetchData()
    },

    mounted () {

    },

    data () {
      return {
        rows: [],
        code: '',
        modes: ['Dynamic proportional symbols', 'Fixed intervals', 'Dynamic proportional symbols'],
        fontsize: ['12px', '13px', '14px', '16px', '18px', '20px', '22px', '24px'],
        codefolding: ['manual', 'markbegin', 'markbeginend'],
        softwrap: ['off', '50', 'free'],
        selected: {
          mode: 'Dynamic proportional symbols',
          theme: 'github',
          fontsize: '12px',
          codefolding: 'markbegin',
          softwrap: 'free',
          selectionstyle: 'text',
          highlightline: 'true'
        }
      }
    },

    methods: {
      fetchData () {
        Plotly.d3.csv('', (err, rows) => {
          if (err) {
            rows = []
          }
          this.rows = rows
          this.drawMap()
        })
      },

      drawMap () {
        let rows = this.rows
        function unpack (rows, key) {
          return rows.map(row => row[key])
        }

        var cityName = unpack(rows, 'name')
        var cityPop = unpack(rows, 'pop')
        var cityLat = unpack(rows, 'lat')
        var cityLon = unpack(rows, 'lon')
        var citySize = []
        var hoverText = []
        var scale = 50000

        for (let i = 0; i < cityPop.length; i++) {
          var currentSize = cityPop[i] / scale
          var currentText = cityName[i] + ' pop: ' + cityPop[i]
          citySize.push(currentSize)
          hoverText.push(currentText)
        }

        var data = [{
          type: 'scattergeo',
          locationmode: 'KOREA',
          lat: cityLat,
          lon: cityLon,
          hoverinfo: 'text',
          text: hoverText,
          marker: {
            size: citySize,
            line: {
              color: 'black',
              width: 2
            }
          }
        }]

        var layout = {
          title: '2014 US City Populations',
          showlegend: false,
          margin: { t: 0, l: 0, b: 0, r: 0 },
          geo: {
            scope: 'kor',
            projection: {
              type: 'south korea'
            },
            showland: true,
            landcolor: 'rgb(217, 217, 217)',
            subunitwidth: 1,
            countrywidth: 1,
            subunitcolor: 'rgb(255,255,255)',
            countrycolor: 'rgb(255,255,255)'
          }
        }

        Plotly.plot(this.$refs.map, data, layout, { showLink: false })
      }
    }
  }
</script>

<style scoped>
  .js-plotly-plot {
    max-width: 100%;
  }
</style>
