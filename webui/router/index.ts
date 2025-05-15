import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Import your view components
import VolumesView from '../views/VolumesView.vue'
import CollectionsView from '../views/CollectionsView.vue'
import ActivityView from '../views/ActivityView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    // Default path under /ipelfs/ will redirect to /ipelfs/volumes
    path: '/',
    name: 'HomeBaseRedirect', // Or a more descriptive name like 'IpelfsRoot'
    redirect: '/volumes',
  },
  {
    path: '/volumes', // Accessible at /ipelfs/volumes
    name: 'Volumes',
    component: VolumesView,
  },
  {
    path: '/collections', // Accessible at /ipelfs/collections
    name: 'Collections',
    component: CollectionsView,
  },
  {
    path: '/activity', // Accessible at /ipelfs/activity
    name: 'Activity',
    component: ActivityView,
  },
  // Catch-all route for 404s under /ipelfs/ (optional)
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'NotFound',
  //   component: () => import('../views/NotFoundView.vue') // Create a NotFoundView.vue
  // }
]

const router = createRouter({
  // Set the base URL for the application. All routes will be prefixed with /ipelfs/
  history: createWebHistory('/ipelfs/'),
  routes,
  // Optional: Add active class for router links if you use <router-link> later
  // linkActiveClass: 'active-nav-link',
  // linkExactActiveClass: 'exact-active-nav-link',
})

export default router
