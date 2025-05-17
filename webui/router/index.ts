import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { nextTick } from 'vue'

import HomeView from '../views/HomeView.vue' // Insights
import VolumesView from '../views/VolumesView.vue'
import CollectionsView from '../views/CollectionsView.vue'
import ActivityView from '../views/ActivityView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Insights',
    component: HomeView,
    meta: { title: `Insights` },
  },
  {
    path: '/volumes',
    name: 'Volumes',
    component: VolumesView,
    meta: { title: `Volumes` },
  },
  {
    path: '/collections',
    name: 'Collections',
    component: CollectionsView,
    meta: { title: `Collections` },
  },
  {
    path: '/activity',
    name: 'Activity',
    component: ActivityView,
    meta: { title: `Activity` },
  },
  // Catch-all route for 404s under /ipelfs/ (optional)
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'NotFound',
  //   component: () => import('../views/NotFoundView.vue') // Create a NotFoundView.vue
  // }
]

const router = createRouter({
  history: createWebHistory('/ipelfs/'),
  routes,
})

router.afterEach((to) => {
  nextTick(() => {
    if (to.meta && to.meta.title) {
      document.title = to.meta.title as string
    } else {
      document.title = 'ipelfs'
    }
  })
})

export default router
