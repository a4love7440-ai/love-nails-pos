import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { fmt } from '../constants'

const RANGES = ['Today', 'This Week', 'This Month']

export default function Reports({ employees }) {
  const [range, setRange] = useState('Today')
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [range])

  async function load() {
    setLoading(true)
    const now = new Date()
    let from = new Date()
    if (range === 'Today') { from.setHours(0,0,0,0) }
    else if (range === 'This Week') { const d = now.getDay(); from.setDate(now.getDate()-d); from.setHours(0,0,0,0) }
    else { from = new Date(now.getFullYear(), now.getMonth(), 1) }
    const { data } = await supabase.from('tickets').select('*, ticket_items(*), ticket_tips(*), payments(*)').eq('status', 'Completed').gte('created_at', from.toISOString()).order('created_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }

  const rev = tickets.reduce((s, t) => s + (t.total || 0), 0)
  const tips = tickets.reduce((s, t) => s + (t.tip_total || 0), 0)
  const cash = tickets.reduce((s, t) => s + (t.payments||[]).filter(p => p.method==='Cash').reduce((a,b) => a+(b.amount||0), 0), 0)
  const card = tickets.reduce((s, t) => s + (t.payments||[]).filter(p => ['Credit Card','Debit Card'].includes(p.method)).reduce((a,b) => a+(b.amount||0), 0), 0)
  const zelle = tickets.reduce((s, t) => s + (t.payments||[]).filter(p => p.method==='Zelle').reduce((a,b) => a+(b.amount||0), 0), 0)
  const venmo = tickets.reduce((s, t) => s + (t.payments||[]).filter(p => p.method==='Venmo').reduce((a,b) => a+(b.amount||0), 0), 0)

  const empMap = {}
  tickets.forEach(t => {
    ;(t.ticket_items||[]).forEach(item => {
      const id = item.employee_id; if (!id) return
      if (!empMap[id]) empMap[id] = { name: item.employee_name, svc: 0, tip: 0, cnt: 0 }
      empMap[id].svc += item.price||0; empMap[id].cnt++
    })
    ;(t.ticket_tips||[]).forEach(tip => {
      const id = tip.employee_id; if (!id) return
      if (!empMap[id]) empMap[id] = { name: tip.employee_name, svc: 0, tip: 0, cnt: 0 }
      empMap[id].tip += tip.amount||0
    })
  })
  const empStats = Object.entries(empMap).map(([id, v]) => ({ id, ...v, color: employees.find(e => e.id === id)?.color || 'var(--pink)' })).sort((a,b) => b.svc - a.svc)

  return (
    <div className="page">
      <div className="ph">
        <div><div className="ptitle">Reports</div><div className="psub">Sales summary</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {RANGES.map(r => <button key={r} className={`btn ${range===r ? 'btn-p' : 'btn-g'} btn-sm`} onClick={() => setRange(r)}>{r}</button>)}
        </div>
      </div>
      {loading ? <div className="loading"><div className="spinner" /><span>Loading…</span></div> : <>
        <div className="sg">
          {[
            { l: 'Total Revenue', v: fmt(rev), c: 'var(--pink)' },
            { l: 'Cash', v: fmt(cash), c: 'var(--green)' },
            { l: 'Card', v: fmt(card), c: 'var(--blue)' },
            { l: 'Zelle', v: fmt(zelle), c: 'var(--purple)' },
            { l: 'Venmo', v: fmt(venmo), c: 'var(--yellow)' },
            { l: 'Tips', v: fmt(tips), c: 'var(--yellow)' },
            { l: 'Tickets', v: tickets.length, c: 'var(--text)' },
          ].map(s => <div className="sc" key={s.l}><div className="sl">{s.l}</div><div className="sv" style={{ color: s.c }}>{s.v}</div></div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-title">Employee Breakdown</div>
            {!empStats.length && <div className="empty">No data</div>}
            <table>
              <thead><tr><th>Employee</th><th>Services</th><th>Revenue</th><th>Tips</th></tr></thead>
              <tbody>
                {empStats.map(e => (
                  <tr key={e.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span className="ea" style={{ background: e.color, width: 26, height: 26, fontSize: 10 }}>{(e.name||'?')[0]}</span>{e.name}</div></td>
                    <td style={{ color: 'var(--text2)' }}>{e.cnt}</td>
                    <td style={{ color: 'var(--pink)', fontWeight: 700 }}>{fmt(e.svc)}</td>
                    <td style={{ color: 'var(--yellow)' }}>{fmt(e.tip)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-title">Ticket History</div>
            {!tickets.length && <div className="empty">No tickets</div>}
            <table>
              <thead><tr><th>#</th><th>Customer</th><th>Method</th><th>Total</th></tr></thead>
              <tbody>
                {tickets.slice(0,20).map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text3)' }}>#{t.number}</td>
                    <td style={{ fontWeight: 500 }}>{t.customer_name || 'Walk-in'}</td>
                    <td><span className="bdg b-gr">{t.pay_method || '—'}</span></td>
                    <td style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(t.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>}
    </div>
  )
}
