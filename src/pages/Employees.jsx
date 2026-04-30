import { useState } from 'react'
import { supabase } from '../supabase'
import Ico from '../Ico'

export default function Employees({ employees, setEmployees, showToast }) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', phone:'', role:'Staff', commission_rate:'', color:'#f472b6', active: true })
  const [saving, setSaving] = useState(false)

  function openNew() { setEditing(null); setForm({ name:'', phone:'', role:'Staff', commission_rate:'', color:'#f472b6', active: true }); setShowModal(true) }
  function openEdit(e) { setEditing(e); setForm({ name: e.name, phone: e.phone||'', role: e.role, commission_rate: e.commission_rate||'', color: e.color||'#f472b6', active: e.active }); setShowModal(true) }

  async function save() {
    if (!form.name) return showToast('Name is required.', 'error')
    setSaving(true)
    const payload = { ...form, commission_rate: parseFloat(form.commission_rate) || null }
    if (editing) {
      const { error } = await supabase.from('employees').update(payload).eq('id', editing.id)
      if (error) { showToast('Error: ' + error.message, 'error'); setSaving(false); return }
      setEmployees(prev => prev.map(e => e.id === editing.id ? { ...e, ...payload } : e))
      showToast('Employee updated!')
    } else {
      const { data, error } = await supabase.from('employees').insert(payload).select().single()
      if (error) { showToast('Error: ' + error.message, 'error'); setSaving(false); return }
      setEmployees(prev => [...prev, data])
      showToast('Employee added!')
    }
    setShowModal(false)
    setSaving(false)
  }

  async function toggle(emp) {
    const active = !emp.active
    await supabase.from('employees').update({ active }).eq('id', emp.id)
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, active } : e))
    showToast(active ? `${emp.name} activated.` : `${emp.name} deactivated.`)
  }

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Employees</div><div className="psub">{employees.filter(e => e.active).length} active · {employees.length} total</div></div>
        <button className="btn btn-p" onClick={openNew}><Ico name="plus" size={15} /> New Employee</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Employee</th><th>Role</th><th>Phone</th><th>Commission</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {!employees.length && <tr><td colSpan={6}><div className="empty">No employees yet</div></td></tr>}
            {employees.map(emp => (
              <tr key={emp.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><span className="ea" style={{ background: emp.color || 'var(--pink)' }}>{emp.name[0]}</span><span style={{ fontWeight: 600 }}>{emp.name}</span></div></td>
                <td><span className={`bdg ${emp.role==='Admin' ? 'b-p' : emp.role==='Manager' ? 'b-b' : 'b-gr'}`}>{emp.role}</span></td>
                <td style={{ color: 'var(--text2)' }}>{emp.phone || '—'}</td>
                <td style={{ color: 'var(--text2)' }}>{emp.commission_rate ? `${emp.commission_rate}%` : '—'}</td>
                <td><span className={`bdg ${emp.active ? 'b-g' : 'b-r'}`}>{emp.active ? 'Active' : 'Inactive'}</span></td>
                <td><div style={{ display: 'flex', gap: 7 }}><button className="btn btn-g btn-sm" onClick={() => openEdit(emp)}><Ico name="edit" size={13} /></button><button className="btn btn-g btn-sm" onClick={() => toggle(emp)}>{emp.active ? 'Deactivate' : 'Activate'}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mt">{editing ? 'Edit Employee' : 'New Employee'}</div>
            <div className="fr">
              <div className="fg"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="fg"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="fg"><label>Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option>Admin</option><option>Manager</option><option>Staff</option></select></div>
              <div className="fg"><label>Commission %</label><input placeholder="60" value={form.commission_rate} onChange={e => setForm({ ...form, commission_rate: e.target.value })} /></div>
              <div className="fg"><label>Color</label><input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
            </div>
            <div className="mf">
              <button className="btn btn-g" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-p" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
