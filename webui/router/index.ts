import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Import your view components
import HomeView from '../views/HomeView.vue' // Import HomeView
import VolumesView from '../views/VolumesView.vue'
import CollectionsView from '../views/CollectionsView.vue'
import ActivityView from '../views/ActivityView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/', // This is relative to the base '/ipelfs/'
    name: 'Home', // Changed name
    component: HomeView, // Component is now HomeView
    // Redirect removed
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
