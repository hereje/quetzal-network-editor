import line from '@static/links_test.geojson'
import points from '@static/nodes_test.geojson'


// Filter links from selected line








var linksHeader = {...line}
linksHeader.features = []
var nodesHeader = {...points}
nodesHeader.features = []


export default {
    state: {
      linksAreLoaded: false,
      nodesAreLoaded: false,
      links: line, 
      editorTrip: null,
      editorNodes: nodesHeader,
      editorLinks: linksHeader,
      nodes: points, 
      trip_id : []//Array.from(new Set(line.features.map(item => item.properties.trip_id)))
    },
  
    mutations: {
      linksLoaded(state) {
        state.linksAreLoaded = true
      },
      nodeLoaded(state) {
        state.nodesAreLoaded = true
      },

      setEditorTrip(state,payload){
        //set Trip Id
        state.editorTrip = payload
        // set editor links corresponding to trip id
        var filtered = {...state.links}
        filtered.features = filtered.features.filter(link => link.properties.trip_id == state.editorTrip); 
        state.editorLinks = filtered
        // get the corresponding nodes
        this.commit('getEditorNodes',{nodes:state.nodes})
      },
      getEditorNodes(state,payload){
        // payload contain nodes. state.nodes or state.editorNodes
        // find the nodes in the editor links
        let a = state.editorLinks.features.map(item => item.properties.a)
        let b = state.editorLinks.features.map(item => item.properties.b)
        let editorNodesList =  Array.from(new Set([...a, ...b]))
        // set nodes corresponding to trip id
        var filtered = {...payload.nodes}
        filtered.features = filtered.features.filter(node => editorNodesList.includes(node.properties.index)); 
        state.editorNodes = filtered
      },
      //apply change to Links
      confirmChanges(state){
        var filtered = {...state.links}
        filtered.features = filtered.features.filter(link => link.properties.trip_id == state.editorTrip); 
        let toDelete = filtered.features.filter(item => !state.editorLinks.features.includes(item))

        state.links.features = state.links.features.filter(item => !toDelete.includes(item));
      },

      //
      //actions
      //

      cutLineFromNode(state,payload)
      {
        // Filter links from selected line
        let nodeId = payload.selectedNode.index
        state.editorLinks.features.sort((a, b) => a.properties.link_sequence - b.properties.link_sequence)

        let toDelete = [];
        for (const [i, link] of state.editorLinks.features.entries()) {
          if (link.properties.b == nodeId) {
            toDelete = state.editorLinks.features.slice(i + 1);
            break;
          }
        }
        console.log(toDelete)
        // Delete links
        state.editorLinks.features = state.editorLinks.features.filter(item => !toDelete.includes(item));
        this.commit('getEditorNodes',{nodes:state.editorNodes})
      },

      cutLineAtNode(state,payload)
      {
        // Filter links from selected line
        let nodeId = payload.selectedNode.index
        state.editorLinks.features.sort((a, b) => a.properties.link_sequence - b.properties.link_sequence)

        let toDelete = [];
        for (const [i, link] of state.editorLinks.features.entries()) {
          if (link.properties.a == nodeId) {
            toDelete = state.editorLinks.features.slice(0, i);
            //console.log(toDelete)
            break;
          }
        }
        // Delete links
        state.editorLinks.features = state.editorLinks.features.filter(item => !toDelete.includes(item));
        this.commit('getEditorNodes',{nodes:state.editorNodes})
      }

        
  
    },
  
    getters: {
      linksAreLoaded: (state) => state.linksAreLoaded,
      nodesAreLoaded: (state) => state.nodesAreLoaded,
      links: (state) => state.links,
      nodes: (state) => state.nodes,
      route_id: (state) => state.route_id,
      editorTrip: (state) => state.editorTrip,
      editorLinks: (state) => state.editorLinks,
      editorNodes: (state) => state.editorNodes,
      trip_id (state) {
        return Array.from(new Set(state.links.features.map(item => item.properties.trip_id)))
      }
    },
  }

  
  



