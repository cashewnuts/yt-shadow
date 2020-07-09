import { renderDashboard } from './views/Dashboard'
import { createLogger } from './helpers/logger'

const element = document.getElementById('dashboard-id')
if (element) {
  renderDashboard(element)
}
