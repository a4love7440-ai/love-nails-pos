export const CATEGORIES = [
  { id: 'c1', name: 'Manicure', color: '#f9a8d4' },
  { id: 'c2', name: 'Pedicure', color: '#86efac' },
  { id: 'c3', name: 'Acrylic', color: '#93c5fd' },
  { id: 'c4', name: 'Gel X', color: '#c4b5fd' },
  { id: 'c5', name: 'Dipping', color: '#fcd34d' },
  { id: 'c6', name: 'Add-on', color: '#e5e7eb' },
]
export const SERVICES = [
  { id: 's1', catId: 'c1', name: 'Regular Manicure', price: 25, mins: 30 },
  { id: 's2', catId: 'c1', name: 'Gel Manicure', price: 45, mins: 45 },
  { id: 's3', catId: 'c1', name: 'Spa Manicure', price: 35, mins: 40 },
  { id: 's4', catId: 'c2', name: 'Regular Pedicure', price: 35, mins: 40 },
  { id: 's5', catId: 'c2', name: 'Deluxe Pedicure', price: 50, mins: 60 },
  { id: 's6', catId: 'c2', name: 'Spa Pedicure', price: 65, mins: 75 },
  { id: 's7', catId: 'c3', name: 'Full Set Acrylic', price: 50, mins: 60 },
  { id: 's8', catId: 'c3', name: 'Acrylic Fill', price: 35, mins: 45 },
  { id: 's9', catId: 'c4', name: 'Gel X Full Set', price: 65, mins: 75 },
  { id: 's10', catId: 'c4', name: 'Gel X Fill', price: 45, mins: 50 },
  { id: 's11', catId: 'c5', name: 'Dipping Full Set', price: 55, mins: 60 },
  { id: 's12', catId: 'c5', name: 'Dipping Fill', price: 40, mins: 45 },
  { id: 's13', catId: 'c6', name: 'French Tip', price: 10, mins: 10 },
  { id: 's14', catId: 'c6', name: 'Gel Polish', price: 15, mins: 15 },
  { id: 's15', catId: 'c6', name: 'Nail Art (per nail)', price: 5, mins: 5 },
]
export const PAYMENT_METHODS = ['Cash','Credit Card','Debit Card','Zelle','Venmo','CashApp']
export const APPT_STATUSES = ['Booked','Confirmed','Checked In','Completed','No-show','Cancelled']
export const STATUS_BADGE = { Booked:'b-b', Confirmed:'b-p', 'Checked In':'b-y', Completed:'b-g', 'No-show':'b-r', Cancelled:'b-gr' }
export const fmt = (n) => `$${Number(n || 0).toFixed(2)}`
export const todayStr = () => new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
