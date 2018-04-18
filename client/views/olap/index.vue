
<template>
  <div>
        <div class="tile is-ancestor" style="margin-left: 1px; margin-top: 2px; margin-bottom: 2px;">
          <div class="tile is-parent">
            <article class="tile is-child box">
              <h4 class="title">V-Map</h4>
              <!--<div id="vmap" style="width:100%;height:570px;"></div>-->
              <div id="map" style="width:100%;height:570px;"></div>
              <p style="margin-top: 20px; margin-bottom: 20px;">
                <a class="button is-info is-outlined" @click="drawPolygon">CA 드릴다운</a>
                <a class="button is-info is-outlined">US 롤업</a>
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
                <p class="subtitle is-5">All: {{address}} </p>
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
  /* eslint-disable */
  import Plotly from 'plotly.js'
  import { Tabs, TabPane } from 'vue-bulma-tabs'
//  import ContextMenu from 'ol-contextmenu'

  export default {
    components: {
//      ContextMenu,
      Tabs,
      TabPane,
    },

    created () {
    },

    mounted () {
      var me = this;
//      vw.ol3.MapOptions = {
//        basemapType: vw.ol3.BasemapType.GRAPHIC,
//        controlDensity: vw.ol3.DensityType.EMPTY,
//        interactionDensity: vw.ol3.DensityType.BASIC,
//        controlsAutoArrange: true,
//        homePosition: vw.ol3.CameraPosition,
//        initPosition: vw.ol3.CameraPosition
//      };
//      me.vmap = new vw.ol3.Map("vmap", vw.ol3.MapOptions);

      var Base = new ol.layer.Tile({
        name : "Base",
        source: new ol.source.XYZ({
          url: 'http://api.vworld.kr/req/wmts/1.0.0/D01A2D82-B1E6-3340-84D4-462002F06506/Base/{z}/{y}/{x}.png'
        })
      });
      var olView = new ol.View({
        center: ol.proj.transform([127.100616,37.402142], 'EPSG:4326', 'EPSG:3857'),//좌표계 변환
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
//            callback: center // `center` is your callback function
          },
          {
            text: 'Drill Down',
            classname: 'some-style-class', // you can add this icon with a CSS class
                                           // instead of `icon` property (see next line)
//            icon: 'img/marker.png',  // this can be relative or absolute
//            callback: marker
          },
          {
            text: '주소 획득',
            classname: 'some-style-class', // you can add this icon with a CSS class
                                           // instead of `icon` property (see next line)
//            icon: 'img/marker.png',  // this can be relative or absolute
            callback: me.getAddress
          },
          '-' // this is a separator
        ]
      });

      me.map.addControl(contextmenu);
      me.map.getViewport().addEventListener('contextmenu', function (evt) {
        evt.preventDefault();
        console.log(ol.proj.toLonLat(me.map.getEventCoordinate(evt)));
        me.x = ol.proj.toLonLat(me.map.getEventCoordinate(evt))[0]
        me.y = ol.proj.toLonLat(me.map.getEventCoordinate(evt))[1]

      })

    },

    data () {
      return {
        vmap: [],
        map:[],
        contextmenu:[],
        modes: ['Dynamic proportional symbols', 'Fixed intervals', 'Dynamic proportional symbols'],
        selected: {
          mode: 'Dynamic proportional symbols',
          theme: 'github',
          fontsize: '12px',
          codefolding: 'markbegin',
          softwrap: 'free',
          selectionstyle: 'text',
          highlightline: 'true'
        },
        address:'',
        state:'',
        si:'',
        dong:'',
        detailAddress:'',
        x: '',
        y: '',
        coordinates: [ [ 14097479.31202193, 4269696.333845764 ],
          [ 14097479.31202193, 4291146.428300351 ],
          [ 14111358.784904309, 4291146.428300351 ],
          [ 14111358.784904309, 4269696.333845764 ] ]
      }
    },

    methods: {
      getAddress: function () {
        var me = this
        $.ajax({
          type:"get",
          url: 'http://api.vworld.kr/req/address?service=address&request=GetAddress&key=D01A2D82-B1E6-3340-84D4-462002F06506&format=json&point=' + me.x + ',' + me.y + '&type=both',
          dataType : "jsonp",
          jsonp : "callback",
          contentType : "text/json;charset=UTF-8",
          success : function(data){
            var result = data.response.result[0];
            console.log(data)
            me.address = result.text;
            me.state = result.structure.level1;
            me.si = result.structure.level2;
            me.dong = result.structure.level1;
            me.detailAddress = result.structure.level5;
          }
        });
      },
      drawPolygon: function() {
        var me = this;
        var polygon_feature = new ol.Feature({
          geometry : new ol.geom.Polygon([ me.coordinates ])
        });
        var style = new ol.style.Style({
//          stroke : new ol.style.Stroke({
//            color : [ 0, 255, 0, .7 ],
//            width : 3
//          }),
          fill : new ol.style.Fill({
            color : [ 255, 0, 0, .4 ]
          })
        });
        polygon_feature.setStyle(style);
        var vector_layer = new ol.layer.Vector({
          source : new ol.source.Vector({
            features : [ polygon_feature ]
          })
        })
        console.log("draw")
        me.map.addLayer(vector_layer);
      }
    }
  }
</script>

<style scoped>
  .context_menu{
    background-color:white;
    border:1px solid gray;
  }
  .context_menu_item{
    padding:3px 6px;
  }
  .context_menu_item:hover{
    background-color:#CCCCCC;
  }
  .context_menu_separator{
    background-color:gray;
    height:1px;
    margin:0;
    padding:0;
  }
  #clearDirectionsItem, #getDirectionsItem{
    display:none;
  }
  /*	end styles for the ContextMenu	*/

  #map_container{
    height:100%;
  }
</style>
