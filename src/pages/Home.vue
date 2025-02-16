<script>
import SidePanel from '../components/SidePanel.vue'
import Map from '../components/Map.vue'
import ColorPicker from '../components/utils/ColorPicker.vue'
// only used to force to see translation to vue-gettext
const $gettext = s => s

export default {
  name: 'Home',
  components: {
    Map,
    SidePanel,
    ColorPicker,
  },
  data () {
    return {
      nodes: {},
      links: {},
      selectedTrips: [],
      editorTrip: null,
      actionsList: [{
        value: 'Edit Line Info',
        name: $gettext('Edit Line Info'),
      },
      {
        value: 'Cut Line From Node',
        name: $gettext('Cut Line From Node'),
      },
      {
        value: 'Cut Line At Node',
        name: $gettext('Cut Line At Node'),
      },
      {
        value: 'Extend Line Upward',
        name: $gettext('Extend Line Upward'),
      },
      {
        value: 'Extend Line Downward',
        name: $gettext('Extend Line Downward'),
      },
      {
        value: 'Add Stop Inline',
        name: $gettext('Add Stop Inline'),
      },
      {
        value: 'Move Stop',
        name: $gettext('Move Stop'),
      },
      {
        value: 'Delete Stop',
        name: $gettext('Delete Stop'),
      },
      {
        value: 'Edit Link Info',
        name: $gettext('Edit Link Info'),
      },
      {
        value: 'Edit Node Info',
        name: $gettext('Edit Node Info'),
      }],
      action: null,
      selectedNode: null,
      selectedLink: null,
      showDialog: false,
      editorForm: {},
      cursorPosition: [],
      tripToDelete: null,
      lingering: true,
    }
  },
  watch: {

  },
  created () {
    this.links = this.$store.getters.links
    this.nodes = this.$store.getters.nodes
    this.editorTrip = this.$store.getters.editorTrip

    this.$store.commit('changeNotification',
      { text: $gettext('double click to edit line, right click to edit line properties'), autoClose: false })
  },

  methods: {
    actionClick (event) {
      this.action = event.action

      if (this.action === 'Edit Line Info') {
        this.editorForm = structuredClone(this.$store.getters.editorLineInfo)
        this.lingering = event.lingering
        this.showDialog = true
      } else if (this.action === 'Edit Link Info') {
        // link is clicked on the map
        this.selectedLink = event.selectedFeature.properties
        // map selected link doesnt not return properties with null value. we need
        // to get the links in the store with the selected index.
        this.editorForm = this.$store.getters.editorLinks.features.filter(
          (link) => link.properties.index === this.selectedLink.index)
        this.editorForm = this.editorForm[0].properties

        // filter properties to only the one that are editable.
        const filteredKeys = this.$store.getters.lineAttributes
        const uneditable = ['a', 'b', 'index', 'link_sequence']
        const filtered = Object.keys(this.editorForm)
          .filter(key => !filteredKeys.includes(key))
          .reduce((obj, key) => {
            obj[key] = {
              value: this.editorForm[key],
              disabled: uneditable.includes(key),
            }
            return obj
          }, {})
        this.editorForm = filtered
        this.showDialog = true
      } else if (this.action === 'Edit Node Info') {
        this.selectedNode = event.selectedFeature.properties
        // map selected node doesnt not return properties with nanulln value.
        // we need to get the node in the store with the selected index.
        this.editorForm = this.$store.getters.editorNodes.features.filter(
          (node) => node.properties.index === this.selectedNode.index)
        this.editorForm = this.editorForm[0].properties

        // filter properties to only the one that are editable.
        const uneditable = ['index']
        const filtered = Object.keys(this.editorForm)
          .reduce((obj, key) => {
            obj[key] = {
              value: this.editorForm[key],
              disabled: uneditable.includes(key),
            }
            return obj
          }, {})
        this.editorForm = filtered
        this.showDialog = true
      } else if (['Cut Line From Node', 'Cut Line At Node', 'Move Stop', 'Delete Stop'].includes(this.action)) {
        this.selectedNode = event.selectedFeature.properties
        this.applyAction()
      } else if (this.action === 'Add Stop Inline') {
        this.selectedLink = event.selectedFeature.properties
        this.cursorPosition = event.lngLat
        this.applyAction()
      }
    },

    applyAction () {
      // click yes on dialog
      this.showDialog = false
      switch (this.action) {
        case 'Cut Line From Node':
          this.$store.commit('cutLineFromNode', { selectedNode: this.selectedNode })
          break
        case 'Cut Line At Node':
          this.$store.commit('cutLineAtNode', { selectedNode: this.selectedNode })
          break
        case 'Delete Stop':
          this.$store.commit('deleteNode', { selectedNode: this.selectedNode })
          break
        case 'Edit Link Info':
          this.$store.commit('editLinkInfo', { selectedLinkId: this.selectedLink.index, info: this.editorForm })
          break
        case 'Edit Node Info':
          this.$store.commit('editNodeInfo', { selectedNodeId: this.selectedNode.index, info: this.editorForm })
          break
        case 'Edit Line Info':
          this.$store.commit('editLineInfo', this.editorForm)
          break
        case 'deleteTrip':
          this.$store.commit('deleteTrip', this.tripToDelete)
          break
        case 'Add Stop Inline':
          this.$store.commit('addNodeInline', { selectedLink: this.selectedLink, lngLat: this.cursorPosition })
          break
      }
      if (!this.lingering) {
        this.confirmChanges()
        this.lingering = true
      }
    },
    cancelAction () {
      this.showDialog = false
      if (!this.lingering) {
        this.abortChanges()
        this.lingering = true
      }
    },
    confirmChanges () {
      // confirm changes on sidePanel, this overwrite Links in store.
      this.$store.commit('confirmChanges')
      // put editTrip and action to null.
      this.editorTrip = null
      this.$store.commit('setEditorTrip', { tripId: null, changeBounds: false })
      this.action = null
      // notification
      this.$store.commit('changeNotification',
        { text: $gettext('modification applied'), autoClose: true, color: 'success' })
    },
    abortChanges () {
      // unselect a trip for edition. nothing to commit on link here.
      // put editTrip and action to null.
      this.editorTrip = null
      this.$store.commit('setEditorTrip', { tripId: null, changeBounds: false })
      this.action = null
      // notification
      this.$store.commit('changeNotification', { text: $gettext('modification aborted'), autoClose: true })
    },
    deleteButton (selectedTrip) {
      this.tripToDelete = selectedTrip
      this.action = 'deleteTrip'
      this.showDialog = true
    },

  },
}
</script>
<template>
  <section class="map-view">
    <v-dialog
      v-model="showDialog"
      persistent
      max-width="290"
      @keydown.enter="applyAction"
      @keydown.esc="cancelAction"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ action == 'deleteTrip'? $gettext("Delete ") + ' '+ tripToDelete + '?': $gettext("Edit Properties") }}
        </v-card-title>

        <v-card-text v-if="['Edit Line Info', 'Edit Link Info', 'Edit Node Info'].includes(action)">
          <v-container>
            <v-col cols="12">
              <v-text-field
                v-for="(value, key) in editorForm"
                :key="key"
                v-model="value['value']"
                :label="key"
                :disabled="value['disabled']"
              >
                <template
                  v-if="key==='route_color'"
                  v-slot:append
                >
                  <color-picker
                    v-model="value['value']"
                  />
                </template>
              </v-text-field>
            </v-col>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="grey"
            text
            @click="cancelAction"
          >
            {{ $gettext("Cancel") }}
          </v-btn>

          <v-btn
            color="green darken-1"
            text
            @click="applyAction"
          >
            {{ $gettext("Save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <SidePanel
      v-model="selectedTrips"
      @confirmChanges="confirmChanges"
      @abortChanges="abortChanges"
      @deleteButton="deleteButton"
      @propertiesButton="actionClick"
    />

    <Map
      :selected-trips="selectedTrips"
      @clickFeature="actionClick"
    />
  </section>
</template>
<style lang="scss" scoped>
.map-view {
  height: calc(100% - 50px);
  width: 100%;
  display: flex;
}

</style>
