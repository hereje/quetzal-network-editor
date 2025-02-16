<script>
import Mapbox from 'mapbox-gl'
import { MglMap, MglNavigationControl } from 'vue-mapbox'
import StaticLinks from './StaticLinks.vue'
import EditorLinks from './EditorLinks.vue'
import { mapboxPublicKey } from '@src/config.js'
import arrowImage from '@static/arrow.png'

// Filter links from selected line

export default {
  name: 'Map',
  components: {
    MglMap,
    MglNavigationControl,
    StaticLinks,
    EditorLinks,
  },
  props: {
    selectedTrips: {
      type: Array,
      default: () => [],
    },

  },
  events: ['clickFeature'],
  data () {
    return {
      selectedAction: null,
      showedTrips: this.selectedTrips,
      mapboxPublicKey: null,
      selectedFeature: null,
      isEditorMode: false,
      mapIsLoaded: false,
      drawMode: false,
      hoverId: null,
      mapDiv: null,
    }
  },
  computed: {

    showLeftPanel () {
      return this.$store.getters.showLeftPanel
    },
    editorTrip () {
      return this.$store.getters.editorTrip
    },
    editorNodes () {
      return this.$store.getters.editorNodes
    },
    drawLine () {
      return this.$store.getters.newLink
    },
    firstNode () {
      return this.$store.getters.firstNode
    },
    lastNode () {
      return this.$store.getters.lastNode
    },
  },
  watch: {
    showLeftPanel () {
      setTimeout(() => this.map.resize(), 250)
    },

    editorNodes (newVal, oldVal) {
      const wasEditorMode = (oldVal.features.length > 0)
      this.isEditorMode = (newVal.features.length > 0)
      if (this.isEditorMode) {
        if (!wasEditorMode) { this.showedTrips = [] }
        if (this.$store.getters.changeBounds) {
          const bounds = new Mapbox.LngLatBounds()
          newVal.features.forEach(node => {
            bounds.extend(node.geometry.coordinates)
          })
          this.map.fitBounds(bounds, {
            padding: 100,
          })
        }
      } else {
        this.showedTrips = this.selectedTrips
      }
    },
    selectedTrips (newVal) {
      this.showedTrips = newVal
    },
    editorTrip (val) {
      if (val) {
        this.isEditorMode = true
      }
    },
    isEditorMode (val) {
      if (val && this.editorNodes.features.length > 0) {
        this.selectedAction = 'Extend Line Upward'
      } else {
        this.selectedAction = null
      }
      if (!val & this.drawMode) {
        this.drawMode = false
      }
    },
    'firstNode.geometry.coordinates' (val) {
      if (this.editorTrip) {
        this.$store.commit('setNewLink', { action: this.selectedAction })
      }
    },
    'lastNode.geometry.coordinates' (val) {
      if (this.editorTrip) {
        this.$store.commit('setNewLink', { action: this.selectedAction })
      }
    },

    selectedAction (newVal, oldVal) {
      if (['Extend Line Upward', 'Extend Line Downward'].includes(newVal)) {
        this.$store.commit('setNewLink', { action: this.selectedAction })
        this.drawMode = true
      } else {
        this.drawMode = false
      }
    },
  },
  created () {
    this.mapboxPublicKey = mapboxPublicKey
  },

  methods: {
    onMapLoaded (event) {
      const bounds = new Mapbox.LngLatBounds()
      this.$store.getters.links.features.forEach(link => {
        bounds.extend(link.geometry.coordinates)
      })
      // for empty (new) project, do not fit bounds around the links geometries.
      if (Object.keys(bounds).length !== 0) {
        event.map.fitBounds(bounds, {
          padding: 100,
        })
      }

      event.map.loadImage(arrowImage, function (err, image) {
        if (err) {
          console.error('err image', err)
          return
        }
        event.map.addImage('arrow', image)
      })
      this.map = event.map
      event.map.dragRotate.disable()
      this.mapIsLoaded = true
    },

    draw (event) {
      if (this.drawMode && this.map.loaded()) {
        // let index = this.drawLine.features.length-1
        this.$store.commit('editNewLink', Object.values(event.mapboxEvent.lngLat))
      }
    },
    addPoint (event) {
      // for a new Line
      if (this.editorNodes.features.length === 0 && this.editorTrip) {
        this.$store.commit('createNewNode', Object.values(event.mapboxEvent.lngLat))
        this.selectedAction = 'Extend Line Upward'
        this.$store.commit('changeNotification', { text: '', autoClose: true })
      }
      if (this.drawMode) {
        const pointGeom = Object.values(event.mapboxEvent.lngLat)
        this.$store.commit('applyNewLink', pointGeom)
        // console.log(this.mapDiv.style.width)
      }
    },
    resetDraw (event) {
      // reset draw line when we leave the map
      if (this.drawMode && this.map.loaded()) {
        if (this.drawLine.action === 'Extend Line Upward') {
          this.$store.commit('editNewLink', this.drawLine.features[0].geometry.coordinates[0])
        } else {
          this.$store.commit('editNewLink', this.drawLine.features[0].geometry.coordinates[1])
        }
      }
    },

    rightClickMap (event) {
      // remove action when right click on map (and not link / nodes)
      if (event.mapboxEvent.originalEvent.button === 2 & !this.hoverId) {
        this.selectedAction = null
      }
    },
    onHover (event) {
      // no drawing when we hover on link or node
      this.drawMode = false
      this.hoverId = event.selectedId
      // change hook when we hover first or last node.
      if (this.hoverId === this.$store.getters.lastNodeId) {
        this.selectedAction = 'Extend Line Upward'
        this.$store.commit('setNewLink', { action: this.selectedAction })
      } else if (this.hoverId === this.$store.getters.firstNodeId) {
        this.selectedAction = 'Extend Line Downward'
        this.$store.commit('setNewLink', { action: this.selectedAction })
      }
    },
    offHover (event) {
      // put back drawmode offHover only if action is not null
      if (this.selectedAction) {
        this.hoverId = null
        this.drawMode = true
      }
    },

  },

}
</script>
<template>
  <MglMap
    :style="{'width': '100%'}"
    :access-token="mapboxPublicKey"
    map-style="mapbox://styles/mapbox/light-v9"

    @load="onMapLoaded"
    @mousemove="draw"
    @mouseout="resetDraw"
    @click="addPoint"
    @mouseup="rightClickMap"
  >
    <MglNavigationControl position="bottom-right" />
    <template v-if="mapIsLoaded">
      <StaticLinks
        :map="map"
        :showed-trips="showedTrips"
        :is-editor-mode="isEditorMode"
        @rightClick="(e) => $emit('clickFeature',e)"
      />
    </template>

    <template v-if="mapIsLoaded">
      <EditorLinks
        :map="map"
        :draw-mode="drawMode"
        @clickFeature="(e) => $emit('clickFeature',e)"
        @onHover="onHover"
        @offHover="offHover"
      />
    </template>
  </MglMap>
</template>
<style lang="scss" scoped>
.map-view {
  width: 100%;

}

</style>
