import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { SERVICES, APPT_STATUSES, STATUS_BADGE, todayStr } from '../constants'
import Ico from '../Ico'

export default function Appointments({ employees, showToast }) {
  const [appts, setAppts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState({ time: '', customer_name: '', service: '', employee_id: '', notes: '' })
  const [saving, setSaving]     = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const today = new Date(); today.setHours(0,0,0,0)
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('time', { ascending: true })
    setAppts(data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.time || !form.customer_name) return showToast('Fill in time and customer name.', 'error')
    setSaving(true)
    const { data, error } = await supabase.from('appointments').insert({ ...form, status: 'Booked' }).select().single()
    if (error) { showToast('Error: ' + error.message, 'error'); setSaving(false); return }
    setAppts(prev => [...prev, data])
    setForm({ time: '', customer_name: '', service: '', employee_id: '', notes: '' })
    setShowModal(false)
    showToast('Appointment added!')
    setSaving(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  async function deleteAppt(id) {
    if (!confirm('Delete this appointment?')) return
    await supabase.from('appointments').delete().eq('id', id)
    setAppts(prev => prev.filter(a => a.id !== id))
    showToast('Appointment deleted.')
  }

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading…</span></div>

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Appointments</div><div className="psub">{todayStr()}</div></div>
        <button className="btn btn-p" onClick={() => setShowModal(true)}><Ico name="plus" size={15} /> New Appointment</button>
      </div>

      {!appts.length && <div className="card"><div className="empty">No appointments today</div></div>}

      {appts.map(a => {
        const emp = employees.find(e => e.id === a.employee_id)
        return (
          <div key={a.id} className="ac">
            <div style={{ fontWeight: 700, color: 'var(--pink)', minWidth: 70, fontSize: 14 }}>{a.time}</div>
            <div style={{ width: 3, height: 42, borderRadius: 2, background: emp?.color || 'var(--border)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.customer_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                {a.service || '—'}{emp ? ` · ${emp.name}` : ''}
              </div>
              {a.notes && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{a.notes}</div>}
            </div>
            <span className={`bdg ${STATUS_BADGE[a.status] || 'b-gr'}`}>{a.status}</span>
            <select style={{ width: 140, fontSize: 12, padding: '6px 9px' }}
              value={a.status} onChange={e => updateStatus(a.id, e.target.value)}>
              {APPT_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-d btn-sm" onClick={() => deleteAppt(a.id)}><Ico name="trash" size={13} /></button>
          </div>
        )
      })}

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mt">New Appointment</div>
            <div className="fr">
              <div className="fg">
                <label>Time *</label>
                <input placeholder="10:00 AM" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
              </div>
              <div className="fg">
                <label>Customer Name *</label>
                <input placeholder="Name" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} />
              </div>
              <div className="fg">
                <label>Service</label>
                <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                  <option value="">Select service</option>
                  {SERVICES.map(s => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Employee</label>
                <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
                  <option value="">Any available</option>
                  {employees.filter(e => e.active).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="fg full">
                <label>Notes</label>
                <textarea rows={2} placeholder="Customer requests, preferences…"
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="mf">
              <button className="btn btn-g" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-p" disabled={saving} onClick={save}>
                {saving ? 'Saving…' : 'Save Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
