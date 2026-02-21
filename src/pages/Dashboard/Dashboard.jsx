import ProviderDashboard from './ProviderDashboard'
import AdminDashboard from './AdminDashboard'

const Dashboard = () => {
  const userRole = localStorage.getItem("userRole")
  
  if (userRole === "provider") {
    return <ProviderDashboard />
  } else if (userRole === "superAdmin") {
    return <AdminDashboard />
  }
  
  return <div>Dashboard</div>
}

export default Dashboard