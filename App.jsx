import { useState, useEffect } from 'react'
import './index.css'
import { supabase } from './supabase'
import { todayStr } from './constants'
import Ico from './Ico'
import { useToast, Toast } from './toast'

import Dashboard   from './pages/Dashboard'
import NewTicket   from './pages/NewTicket'
import Appointments from './pages/Appointments'
import Customers   from './pages/Customers'
import Employees   from './pages/Employees'
import Reports     from './pages/Reports'

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',    icon: 'home'   },
  { id: 'ticket',       label: 'New Ticket',   icon: 'ticket' },
  { id: 'appointments', label: 'Appointments', icon: 'cal'    },
  { id: 'customers',    label: 'Customers',    icon: 'users'  },
  { id: 'employees',    label: 'Employees',    icon: 'cut'    },
  { id: 'reports',      label: 'Reports',      icon: 'bar'    },
]

export default function App() {
  const [page, setPage]           = useState('dashboard')
  const [employees, setEmployees] = useState([])
  const [customers, setCustomers] = useState([])
  const [empLoading, setEmpLoading] = useState(true)
  const { toast, show: showToast } = useToast()

  useEffect(() => {
    loadGlobals()
  }, [])

  async function loadGlobals() {
    const [{ data: emps }, { data: custs }] = await Promise.all([
      supabase.from('employees').select('*').order('name'),
      supabase.from('customers').select('*').order('name'),
    ])
    setEmployees(emps || [])
    setCustomers(custs || [])
    setEmpLoading(false)
  }

  function navigate(id) {
    setPage(id)
    window.scrollTo(0, 0)
  }

  if (empLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        <div style={{ color: 'var(--text3)', fontFamily: "'DM Sans', sans-serif" }}>Loading Love Nails POS…</div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sb-logo">
          <h1>Love Nails</h1>
          <span>POS System</span>
        </div>
        <nav className="nav">
          {NAV.map(n => (
            <div key={n.id} className={`ni ${page === n.id ? 'on' : ''}`} onClick={() => navigate(n.id)}>
              <Ico name={n.icon} size={16} /> {n.label}
            </div>
          ))}
        </nav>
        <div className="sb-foot">
          <div>MVP v1.0</div>
          <div style={{ marginTop: 3 }}>{todayStr()}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        {page === 'dashboard'    && <Dashboard employees={employees} />}
        {page === 'ticket'       && <NewTicket employees={employees} customers={customers} showToast={showToast} onDone={() => navigate('dashboard')} />}
        {page === 'appointments' && <Appointments employees={employees} showToast={showToast} />}
        {page === 'customers'    && <Customers showToast={showToast} />}
        {page === 'employees'    && <Employees employees={employees} setEmployees={setEmployees} showToast={showToast} />}
        {page === 'reports'      && <Reports employees={employees} />}
      </main>

      <Toast toast={toast} />
    </div>
  )
}
