import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Ico from '../Ico'

export default function Customers({ showToast }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState({ name: '', phone: '', email: '', birthday: '', notes: '', allergies: '' })
  const [saving, setSaving]       = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('customers').select('*').order('name')
    setCustomers(data || [])
    setLoading(false)
  }

  function openNew()  { setEditing(null); setForm({ name:'', phone:'', email:'', birthday:'', notes:'', allergies:'' }); setShowModal(true) }
  function openEdit(c) { setEditing(c); setForm({ name: c.name, phone: c.phone||'', email: c.email||'', birthday: c.birthday||'', notes: c.notes||'', allergies: c.allergies||'' }); setShowModal(true) }

  async function save() {
    if (!form.name) return showToast('Name is required.', 'error')
    setSaving(true)
    if (editing) {
      const { error } = await supabase.from('customers').update(form).eq('id', editing.id)
      if (error) { showToast('Error: ' + error.message, 'error'); setSaving(false); return }
      setCustomers(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c))
      showToast('Customer updated!')
    } else {
      const { data, error } = await supabase.from('customers').insert(form).select().single()
      if (error) { showToast('Error: ' + error.message, 'error'); setSaving(false); return }
      setCustomers(prev => [...prev, data].sort((a,b) => a.name.localeCompare(b.name)))
      showToast('Customer added!')
    }
    setShowModal(false)
    setSaving(false)
  }

  async function del(id) {
    if (!confirm('Delete this customer?')) return
    await supabase.from('customers').delete().eq('id', id)
    setCustomers(prev => prev.filter(c => c.id !== id))
    showToast('Customer deleted.')
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  )

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading…</span></div>

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Customers</div><div className="psub">{customers.length} total</div></div>
        <button className="btn btn-p" onClick={openNew}><Ico name="plus" size={15} /> New Customer</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Preferred Services</th><th>Allergies</th><th></th></tr>
          </thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={5}><div className="empty">No customers found</div></td></tr>}
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td style={{ color: 'var(--text2)' }}>{c.phone || '—'}</td>
                <td style={{ color: 'var(--text2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.notes || '—'}</td>
                <td>{c.allergies ? <span className="bdg b-r">{c.allergies}</span> : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button className="btn btn-g btn-sm" onClick={() => openEdit(c)}><Ico name="edit" size={13} /></button>
                    <button className="btn btn-d btn-sm" onClick={() => del(c.id)}><Ico name="trash" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mt">{editing ? 'Edit Customer' : 'New Customer'}</div>
            <div className="fr">
              <div className="fg"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="fg"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="fg"><label>Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="fg"><label>Birthday</label><input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} /></div>
              <div className="fg full"><label>Preferred services / notes</label><textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="fg full"><label>Allergies / warnings ⚠️</label><input value={form.allergies} placeholder="e.g. Allergic to acrylic powder" onChange={e => setForm({ ...form, allergies: e.target.value })} /></div>
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
