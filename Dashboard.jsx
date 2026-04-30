import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { fmt, todayStr } from '../constants'

export default function Dashboard() {
  const [stats, setStats] = useState({ rev: 0, cash: 0, card: 0, tips: 0, count: 0 })
  const [empStats, setEmpStats] = useState([])
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: tickets } = await supabase
      .from('tickets')
      .select('*, ticket_items(*), ticket_tips(*), payments(*)')
      .eq('status', 'Completed')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (tickets) {
      const rev   = tickets.reduce((s, t) => s + (t.total || 0), 0)
      const cash  = tickets.reduce((s, t) => s + (t.payments || []).filter(p => p.method === 'Cash').reduce((a, b) => a + (b.amount || 0), 0), 0)
      const card  = tickets.reduce((s, t) => s + (t.payments || []).filter(p => ['Credit Card','Debit Card'].includes(p.method)).reduce((a, b) => a + (b.amount || 0), 0), 0)
      const tips  = tickets.reduce((s, t) => s + (t.tip_total || 0), 0)
      setStats({ rev, cash, card, tips, count: tickets.length })
      setRecentTickets(tickets.slice(0, 6))

      // Employee breakdown
      const empMap = {}
      tickets.forEach(t => {
        ;(t.ticket_items || []).forEach(item => {
          if (!item.employee_id) return
          if (!empMap[item.employee_id]) empMap[item.employee_id] = { name: item.employee_name, color: '#f472b6', svc: 0, tip: 0, cnt: 0 }
          empMap[item.employee_id].svc += item.price || 0
          empMap[item.employee_id].cnt += 1
        })
        ;(t.ticket_tips || []).forEach(tip => {
          if (!tip.employee_id) return
          if (!empMap[tip.employee_id]) empMap[tip.employee_id] = { name: tip.employee_name, color: '#f472b6', svc: 0, tip: 0, cnt: 0 }
          empMap[tip.employee_id].tip += tip.amount || 0
        })
      })
      setEmpStats(Object.values(empMap).sort((a, b) => b.svc - a.svc))
    }
    setLoading(false)
  }

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading…</span></div>

  return (
    <div className="page">
      <div className="ptitle">Dashboard</div>
      <div className="psub">{todayStr()} — Daily Overview</div>

      <div className="sg">
        {[
          { l: 'Revenue Today', v: fmt(stats.rev), c: 'var(--pink)', s: `${stats.count} tickets` },
          { l: 'Cash',          v: fmt(stats.cash),  c: 'var(--green)' },
          { l: 'Card',          v: fmt(stats.card),  c: 'var(--blue)'  },
          { l: 'Tips Total',    v: fmt(stats.tips),  c: 'var(--yellow)'},
        ].map(s => (
          <div className="sc" key={s.l}>
            <div className="sl">{s.l}</div>
            <div className="sv" style={{ color: s.c }}>{s.v}</div>
            {s.s && <div className="ss">{s.s}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-title">Employee Performance</div>
          {!empStats.length && <div className="empty">No completed tickets today</div>}
          {empStats.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 13 }}>
              <span className="ea" style={{ background: e.color || 'var(--pink)', width: 32, height: 32, fontSize: 12 }}>
                {(e.name || '?')[0]}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{e.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.cnt} service(s)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--pink)', fontSize: 13 }}>{fmt(e.svc)}</div>
                <div style={{ fontSize: 11, color: 'var(--yellow)' }}>+{fmt(e.tip)} tip</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Recent Tickets</div>
          {!recentTickets.length && <div className="empty">No tickets yet today</div>}
          {recentTickets.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>#{t.number} — {t.customer_name || 'Walk-in'}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {(t.ticket_items || []).length} item(s) · {(t.payments || [])[0]?.method || '—'}
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--green)' }}>{fmt(t.total)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
