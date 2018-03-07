import lazyLoading from './lazyLoading'

export default {
  name: 'olap',
  path: '/olap',
  meta: {
    icon: 'fa-bar-chart-o',
    expanded: false,
    link: 'charts/olap.vue'
  },
  component: lazyLoading('olap', true),

  children: [
    {
      name: 'olap',
      path: 'olap',
      component: lazyLoading('olap/olap'),
      meta: {
        link: 'olap/olap.vue'
      }
    }
  ]
}
