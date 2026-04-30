import { useState } from 'react'
import { supabase } from '../supabase'
import { CATEGORIES, SERVICES, PAYMENT_METHODS, fmt } from '../constants'
import Ico from '../Ico'

export default function NewTicket({ employees, customers, showToast, onDone }) {
  const [selCat, setSelCat]       = useState('all')
  const [items, setItems]         = useState([])
  const [tipInputs, setTipInputs] = useState({})
  const [discount, setDiscount]   = useState('')
  const [payMethod, setPayMethod] = useState('Cash')
  const [selCustomer, setSelCustomer] = useState('')
  const [walkIn, setWalkIn]       = useState('')
  const [assignIdx, setAssignIdx] = useState(null)
  const [saving, setSaving]       = useState(false)

  const filtered  = selCat === 'all' ? SERVICES : SERVICES.filter(s => s.catId === selCat)
  const subtotal  = items.reduce((s, i) => s + i.price, 0)
  const discAmt   = parseFloat(discount) || 0
  const tipTotal  = Object.values(tipInputs).reduce((s, v) => s + (parseFloat(v) || 0), 0)
  const total     = subtotal - discAmt + tipTotal

  const activeEmps = employees.filter(e => e.active)
  const empWithSvc = activeEmps.filter(e => items.some(i => i.employeeId === e.id))

  function addSvc(svc) {
    const idx = items.length
    setItems(prev => [...prev, { ...svc, employeeId: '' }])
    setAssignIdx(idx)
  }

  function removeItem(i) {
    const empId = items[i]?.employeeId
    setItems(prev => prev.filter((_, idx) => idx !== i))
    // clear tip if no more services for that emp
    if (empId) {
      const stillHas = items.filter((it, idx) => idx !== i && it.employeeId === empId).length > 0
      if (!stillHas) setTipInputs(prev => { const n = { ...prev }; delete n[empId]; return n })
    }
  }

  async function handleComplete() {
    if (!items.length) return showToast('Add at least one service.', 'error')
    setSaving(true)
    try {
      const cust = customers.find(c => c.id === selCustomer)
      const customerName = cust?.name || walkIn || 'Walk-in'

      // 1. Insert ticket
      const { data: ticket, error: tErr } = await supabase
        .from('tickets')
        .insert({
          customer_name: customerName,
          customer_id:   selCustomer || null,
          subtotal,
          discount_amt:  discAmt,
          tip_total:     tipTotal,
          total,
          pay_method:    payMethod,
          status:        'Completed',
        })
        .select()
        .single()
      if (tErr) throw tErr

      // 2. Insert ticket_items
      const itemRows = items.map(it => ({
        ticket_id:     ticket.id,
        service_name:  it.name,
        price:         it.price,
        employee_id:   it.employeeId || null,
        employee_name: employees.find(e => e.id === it.employeeId)?.name || null,
      }))
      await supabase.from('ticket_items').insert(itemRows)

      // 3. Insert payments
      await supabase.from('payments').insert({ ticket_id: ticket.id, method: payMethod, amount: total })

      // 4. Insert tips
      const tipRows = Object.entries(tipInputs)
        .filter(([, v]) => parseFloat(v) > 0)
        .map(([empId, v]) => ({
          ticket_id:     ticket.id,
          employee_id:   empId,
          employee_name: employees.find(e => e.id === empId)?.name || null,
          amount:        parseFloat(v),
        }))
      if (tipRows.length) await supabase.from('ticket_tips').insert(tipRows)

      showToast(`Ticket #${ticket.number} completed!`)
      setItems([]); setTipInputs({}); setDiscount(''); setSelCustomer(''); setWalkIn(''); setPayMethod('Cash')
      onDone()
    } catch (err) {
      showToast('Error saving ticket: ' + err.message, 'error')
    }
    setSaving(false)
  }

  return (
    <div className="page-wide">
      <div className="ptitle">New Ticket</div>
      <div className="psub">Select services → assign staff → complete payment</div>

      <div className="tl">
        {/* LEFT */}
        <div>
          {/* Customer select */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Customer</label>
                <select value={selCustomer} onChange={e => setSelCustomer(e.target.value)}>
                  <option value="">Walk-in</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {!selCustomer && (
                <div style={{ flex: 1 }}>
                  <label>Walk-in name</label>
                  <input placeholder="Optional" value={walkIn} onChange={e => setWalkIn(e.target.value)} />
                </div>
              )}
            </div>
          </div>

          {/* Service picker */}
          <div className="card">
            <div className="cf">
              {[{ id: 'all', name: 'All', color: 'var(--pink)' }, ...CATEGORIES].map(c => (
                <button key={c.id} className={`cb ${selCat === c.id ? 'on' : ''}`}
                  style={selCat === c.id ? { background: c.color, borderColor: c.color } : {}}
                  onClick={() => setSelCat(c.id)}>{c.name}</button>
              ))}
            </div>
            <div className="svcg">
              {filtered.map(svc => (
                <div key={svc.id} className="svb" onClick={() => addSvc(svc)}>
                  <div className="sn">{svc.name}</div>
                  <div className="sp">{fmt(svc.price)}</div>
                  <div className="st">{svc.mins} min</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Bill */}
        <div className="bp">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 19 }}>Bill</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{items.length} item(s)</span>
          </div>

          {!items.length && <div className="empty">Tap a service to add</div>}

          {items.map((it, i) => {
            const emp = employees.find(e => e.id === it.employeeId)
            return (
              <div key={i} className="bi">
                <div className="bii">
                  <div className="bin">{it.name}</div>
                  <div className="bie">
                    {emp
                      ? <><span className="ea" style={{ width: 16, height: 16, fontSize: 9, background: emp.color }}>{emp.name[0]}</span>{emp.name}</>
                      : <span style={{ color: 'var(--red)', cursor: 'pointer' }} onClick={() => setAssignIdx(i)}>⚠ Assign staff</span>}
                  </div>
                </div>
                <div className="bip">{fmt(it.price)}</div>
                <button className="rb" onClick={() => removeItem(i)}><Ico name="x" size={14} /></button>
              </div>
            )
          })}

          {/* Tips */}
          {empWithSvc.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 9 }}>Tips</div>
              {empWithSvc.map(emp => (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                  <span className="ea" style={{ background: emp.color, width: 26, height: 26, fontSize: 10 }}>{emp.name[0]}</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{emp.name}</span>
                  <input placeholder="$0" style={{ width: 80 }}
                    value={tipInputs[emp.id] || ''}
                    onChange={e => setTipInputs(p => ({ ...p, [emp.id]: e.target.value }))} />
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="btot">
            <div className="br"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="br">
              <span>Discount</span>
              <input placeholder="0" style={{ width: 80, textAlign: 'right' }}
                value={discount} onChange={e => setDiscount(e.target.value)} />
            </div>
            <div className="br"><span>Tips</span><span style={{ color: 'var(--yellow)' }}>{fmt(tipTotal)}</span></div>
            <div className="br tot"><span>Total</span><span>{fmt(total)}</span></div>
          </div>

          {/* Payment */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 9 }}>Payment</div>
            <div className="pg">
              {PAYMENT_METHODS.map(m => (
                <button key={m} className={`pb ${payMethod === m ? 'sel' : ''}`} onClick={() => setPayMethod(m)}>{m}</button>
              ))}
            </div>
          </div>

          <button className="btn btn-p" style={{ width: '100%', marginTop: 18, justifyContent: 'center', padding: '13px' }}
            disabled={saving || !items.length} onClick={handleComplete}>
            {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : <><Ico name="chk" size={16} /> Complete Ticket</>}
          </button>
        </div>
      </div>

      {/* Assign modal */}
      {assignIdx !== null && (
        <div className="overlay" onClick={() => setAssignIdx(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="mt">Assign Employee</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 18 }}>
              For: <strong>{items[assignIdx]?.name}</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {activeEmps.map(emp => (
                <button key={emp.id} className="btn btn-g" style={{ justifyContent: 'flex-start', gap: 10 }}
                  onClick={() => { setItems(p => p.map((it, i) => i === assignIdx ? { ...it, employeeId: emp.id } : it)); setAssignIdx(null) }}>
                  <span className="ea" style={{ background: emp.color, width: 28, height: 28, fontSize: 11 }}>{emp.name[0]}</span>
                  {emp.name}
                </button>
              ))}
            </div>
            <div className="mf">
              <button className="btn btn-g btn-sm" onClick={() => setAssignIdx(null)}>Skip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
