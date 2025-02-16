import '@fortawesome/fontawesome-free/css/all.css'
import 'vuetify/dist/vuetify.min.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@scss/app.scss'

import Vue from 'vue'
import GetTextPlugin from 'vue-gettext'
import { store } from './store'
import router from './router'
import Vuetify from 'vuetify'
import VueApexCharts from 'vue-apexcharts'
import VueApollo from 'vue-apollo'
import ApolloClient from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueLocalStorage from 'vue-localstorage'

import 'promise-polyfill/src/polyfill'

import fr from 'vuetify/es5/locale/fr'
import en from 'vuetify/es5/locale/en'
import translations from './translations.json'

import App from './App.vue'
import { mapboxPublicKey, backUri } from '@src/config.js'

console.assert(mapboxPublicKey)

const languageMixin = {
  methods: {
    $selectBestLanguage (browserLangs, supportedLangs) {
      if (browserLangs.length) {
        for (const lang of browserLangs) {
          const parts = lang.toLowerCase().split('-')
          if (parts.length > 1) {
            parts[1] = parts[1].toUpperCase()
          }
          const normLang = parts.join('-')
          if (supportedLangs.includes(normLang)) {
            return normLang
          } else if (parts.length > 1 && supportedLangs.includes(parts[0])) {
            return parts[0]
          }
        }
        return supportedLangs[0]
      } else {
        return supportedLangs[0]
      }
    },
  },
}
Vue.component('Apexchart', VueApexCharts)

const bestLanguage = languageMixin.methods.$selectBestLanguage(navigator.languages, ['en', 'fr'])

Vue.use(Vuetify)
Vue.use(GetTextPlugin, {
  autoAddKeyAttributes: true,
  availableLanguages: {
    en: 'English',
    fr: 'Français',
  },
  defaultLanguage: bestLanguage,
  translations,
  silent: true,
})
Vue.use(VueApollo)

Vue.use(VueLocalStorage)

Vue.config.productionTip = false
Vue.config.devtools = false

const vuetify = new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: '#B5E0D6',
        secondary: '#2C3E4E',
        secondarydark: '#1A242C',
        lightgrey: '#E3E4E6',
        mediumgrey: '#9E9E9E',
        darkgrey: '#5B5B5C',
        accent: '#2C3E4E',
        chart: {
          lightgreen: '#CDDC39',
          darkgreen: '#4CAF50',
          lightblue: '#00BCD4',
          darkblue: '#2196F3',
          purple: '#673AB7',
          pink: '#E91E63',
          orange: '#FF7B30',
          yellow: '#FFC107',
        },
      },
    },
  },
  icons: {
    iconfont: 'fa',
  },
  lang: {
    locales: { fr, en },
    current: bestLanguage,
  },
})

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: backUri,
    fetch,
    headers: {},
  }),
  cache: new InMemoryCache({
    addTypename: false,
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
  },
})
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

Vue.mixin(languageMixin)

Vue.mixin({
  methods: {
    $flatEdges (obj, recurse = false) {
      let flatObj = obj
      if (obj.edges) {
        flatObj = obj.edges.map(edge => edge.node)
      }
      if (recurse) {
        for (const key in obj) {
          if (obj[key] !== null && typeof obj[key] === 'object') {
            obj[key] = this.$flatEdges(obj[key], true)
          }
        }
      }
      return flatObj
    },
  },
})

const app = new Vue({
  localStorage: {
    info: {
      type: Object,
      default: {},
    },
  },
  router,
  store,
  vuetify,
  apolloProvider,
  render: h => h(App),
  template: '<App/>',
})

app.$mount('#app')
