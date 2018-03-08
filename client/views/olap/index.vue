<template>
  <div>
    <tabs type="boxed">
      <tab-pane label="D3">
        <div class="tile is-ancestor" style="margin-left: 1px; margin-top: 2px; margin-bottom: 2px;">
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
          <div style="margin-top: 10px; margin-right: 15px; ">
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

      </tab-pane>
      <tab-pane label="GoogleMap">

        <div class="tile is-ancestor" style="margin-left: 1px; margin-top: 2px; margin-bottom: 2px;">
          <div class="tile is-parent">
            <article class="tile is-child box">
              <h4 class="title">Map</h4>
              <div id="canvas" style="min-height: 450px;"></div>
              <p style="margin-top: 20px; margin-bottom: 20px;">
                <a class="button is-info is-outlined">전북 - 드릴다운</a>
                <a class="button is-info is-outlined">전북 남원 - 롤업</a>
                <a class="button is-info is-outlined">울산 - 드릴다운</a>
                <a class="button is-info is-outlined">울산 울주군 - 롤업</a>
              </p>
              <label class="label">MDX query editor</label>
              <p class="control">
                <textarea class="textarea" placeholder="Textarea" v-model="googleWKT"></textarea>
              </p>
              <div align="right">
                <p align="right">
                  <button class="button is-primary">Submit</button>
                </p>
              </div>
            </article>
          </div>
          <div style="margin-top: 10px; margin-right: 15px">
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

      </tab-pane>
    </tabs>

  </div>
</template>

<script>
  import Plotly from 'plotly.js'
  import { Tabs, TabPane } from 'vue-bulma-tabs'

  export default {
    components: {
      Tabs,
      TabPane
    },

    created () {
      this.fetchData()

    },

    mounted () {
      this.gmapinit()
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
        },
        gmap: [],
        googleWKT: ''
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
      mapIt: function () {
        var el, obj, wkt;
        el = this.googleWKT;
        wkt = new Wkt.Wkt();
        if (el.last === el.value) { // Remember the last string
          return; // Do nothing if the WKT string hasn't changed
        } else {
          el.last = el.value;
        }
        try { // Catch any malformed WKT strings
          wkt.read(el.value);
        } catch (e1) {
          try {
            wkt.read(el.value.replace('\n', '').replace('\r', '').replace('\t', ''));
          } catch (e2) {
            if (e2.name === 'WKTError') {
              alert('Wicket could not understand the WKT string you entered. Check that you have parentheses balanced, and try removing tabs and newline characters.');
              return;
            }
          }
        }
        obj = wkt.toObject(this.gmap.defaults); // Make an object
        // Add listeners for overlay editing events
        if (!Wkt.isArray(obj) && wkt.type !== 'point') {
          // New vertex is inserted
          google.maps.event.addListener(obj.getPath(), 'insert_at', function (n) {
            app.updateText();
          });
          // Existing vertex is removed (insertion is undone)
          google.maps.event.addListener(obj.getPath(), 'remove_at', function (n) {
            app.updateText();
          });
          // Existing vertex is moved (set elsewhere)
          google.maps.event.addListener(obj.getPath(), 'set_at', function (n) {
            app.updateText();
          });
        } else {
          if (obj.setEditable) {obj.setEditable(false);}
        }
        if (Wkt.isArray(obj)) { // Distinguish multigeometries (Arrays) from objects
          for (i in obj) {
            if (obj.hasOwnProperty(i) && !Wkt.isArray(obj[i])) {
              obj[i].setMap(this.gmap);
            }
            if (wkt.type !== 'point') {
              // New vertex is inserted
              google.maps.event.addListener(obj[i].getPath(), 'insert_at', function (n) {
                app.updateTextPart();
              });
              // Existing vertex is removed (insertion is undone)
              google.maps.event.addListener(obj[i].getPath(), 'remove_at', function (n) {
                app.updateTextPart();
              });
              // Existing vertex is moved (set elsewhere)
              google.maps.event.addListener(obj[i].getPath(), 'set_at', function (n) {
                app.updateTextPart();
              });
            }
          }
          this.features = this.features.concat(obj);
        } else {
          obj.setMap(this.gmap); // Add it to the map
          this.features.push(obj);
        }
        // Pan the map to the feature
        if (obj.getBounds !== undefined && typeof obj.getBounds === 'function') {
          // For objects that have defined bounds or a way to get them
          this.gmap.fitBounds(obj.getBounds());
        } else {
          if (obj.getPath !== undefined && typeof obj.getPath === 'function') {
            // For Polygons and Polylines
            this.gmap.panTo(obj.getPath().getAt(0));
          } else { // But points (Markers) are different
            if (obj.getPosition !== undefined && typeof obj.getPosition === 'function') {
              this.gmap.panTo(obj.getPosition());
            }
          }
        }
        return obj;
      },
      updateText: function () {
        var wkt = new Wkt.Wkt();
        wkt.fromObject(this.features[0]);
        this.googleWKT = wkt.write();
      },
      gmapinit: function () {
        var me = this

        me.gmap = new google.maps.Map(document.getElementById('canvas'), {
          center: new google.maps.LatLng(30, 10),
          defaults: {
            icon: 'red_dot.png',
            shadow: 'dot_shadow.png',
            editable: true,
            strokeColor: '#990000',
            fillColor: '#EEFFCC',
            fillOpacity: 0.6
          },
          disableDefaultUI: true,
          mapTypeControl: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
          },
          panControl: false,
          streetViewControl: false,
          zoom: 2,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP,
            style: google.maps.ZoomControlStyle.SMALL
          }
        });

        google.maps.event.addListener(me.gmap, 'tilesloaded', function () {
          if (!this.loaded) {
            this.loaded = true;
            // NOTE: We start with a MULTIPOLYGON; these aren't easily deconstructed, so we won't set this object to be editable in this example
            me.googleWKT = 'MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 45 20, 30 5, 10 10, 10 30, 20 35), (30 20, 20 25, 20 15, 30 20)))';
            me.mapIt();
          }
        });

        me.gmap.drawingManager = new google.maps.drawing.DrawingManager({
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.MARKER,
              google.maps.drawing.OverlayType.POLYLINE,
              google.maps.drawing.OverlayType.POLYGON,
              google.maps.drawing.OverlayType.RECTANGLE
            ]
          },
          markerOptions: me.gmap.defaults,
          polygonOptions: me.gmap.defaults,
          polylineOptions: me.gmap.defaults,
          rectangleOptions: me.gmap.defaults
        });
        me.gmap.drawingManager.setMap(me.gmap);
        google.maps.event.addListener(me.gmap.drawingManager, 'overlaycomplete', function (event) {
          var wkt;
          app.clearText();
          app.clearMap();
          // Set the drawing mode to "pan" (the hand) so users can immediately edit
          this.setDrawingMode(null);
          // Polygon drawn
          if (event.type === google.maps.drawing.OverlayType.POLYGON || event.type === google.maps.drawing.OverlayType.POLYLINE) {
            // New vertex is inserted
            google.maps.event.addListener(event.overlay.getPath(), 'insert_at', function (n) {
              app.updateText();
            });
            // Existing vertex is removed (insertion is undone)
            google.maps.event.addListener(event.overlay.getPath(), 'remove_at', function (n) {
              app.updateText();
            });
            // Existing vertex is moved (set elsewhere)
            google.maps.event.addListener(event.overlay.getPath(), 'set_at', function (n) {
              app.updateText();
            });
          } else if (event.type === google.maps.drawing.OverlayType.RECTANGLE) { // Rectangle drawn
            // Listen for the 'bounds_changed' event and update the geometry
            google.maps.event.addListener(event.overlay, 'bounds_changed', function () {
              app.updateText();
            });
          }
          app.features.push(event.overlay);
          wkt = new Wkt.Wkt();
          wkt.fromObject(event.overlay);

        });

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
