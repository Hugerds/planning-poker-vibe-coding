import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue' // We'll create this view next

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  // Add other routes here later, e.g., for the game room
  {
    path: '/room/:roomId', // Dynamic segment for room ID
    name: 'Room', // Name for navigation
    component: () => import('../views/RoomView.vue'), // Lazy load room view
    props: true // Pass route params as props to the component (optional but convenient)
  },
  {
    path: '/join/qrcode/:roomId', // QR code join route
    name: 'QRCodeJoin',
    component: () => import('../views/QRCodeJoinView.vue'),
    props: true
  },
  // Rota para lidar com redirecionamentos de convite via QR code
  {
    path: '/invite/:token',
    name: 'QRCodeInvite',
    component: () => import('../views/QRCodeJoinView.vue'),
    props: route => ({
      token: route.params.token,
      // Não temos o roomId ainda, será obtido pelo token
      roomId: null
    })
  }
]

const router = createRouter({
  history: createWebHistory(), // Use HTML5 history mode
  routes
})

export default router
