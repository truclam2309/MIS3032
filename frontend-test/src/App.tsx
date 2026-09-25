import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Request = { id:string; title:string; department:string; amount:number; category:string; reason:string; requester:string; status:string; step:number; created:string }
type ApiRequest = { id:string; title:string; department:string; amount:number; category:string; justification:string; requester:string; status:string }
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const budgets = [{ name:'Operations', limit:300, spent:184.5 }, { name:'Marketing', limit:180, spent:126.8 }, { name:'Engineering', limit:500, spent:318.2 }]
const stages = ['Manager', 'Finance', 'Procurement']
const initial: Request[] = [
  { id:'PR-2026-0012', title:'Laptop cho nhân viên mới', department:'Engineering', amount:42, category:'Thiết bị công nghệ', reason:'Trang bị cho nhân sự bắt đầu tháng này.', requester:'Minh Anh', status:'Chờ Manager duyệt', step:0, created:'Hôm nay' },
  { id:'PR-2026-0011', title:'Gia hạn phần mềm thiết kế', department:'Marketing', amount:18.5, category:'Phần mềm & dịch vụ', reason:'Duy trì giấy phép làm việc cho team sáng tạo.', requester:'Thanh Hà', status:'Chờ Finance duyệt', step:1, created:'Hôm qua' },
]
const money = (n:number) => `₫${n.toFixed(n % 1 ? 1 : 0)}M`

export default function App() {
  const [requests, setRequests] = useState(initial), [dept, setDept] = useState('Operations'), [title, setTitle] = useState(''), [category, setCategory] = useState('Thiết bị công nghệ'), [reason, setReason] = useState(''), [amount, setAmount] = useState(12), [notice, setNotice] = useState(''), [selected, setSelected] = useState<Request | null>(null), [submitting, setSubmitting] = useState(false), [email, setEmail] = useState('employee@demo.com'), [password, setPassword] = useState('')
  const budget = useMemo(() => budgets.find(x => x.name === dept)!, [dept])
  const remaining = budget.limit - budget.spent - amount
  const active = requests.filter(x => x.step < 3 && x.status !== 'Đã từ chối').length
  async function submit(e:FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (!title.trim() || !reason.trim()) return setNotice('Vui lòng nhập tên yêu cầu và lý do mua.')
    if (remaining < 0) return setNotice('Ngân sách không đủ. Hãy điều chỉnh giá trị hoặc chọn phòng ban khác.')

    setSubmitting(true)
    setNotice('')
    try {
      const loginBody = new URLSearchParams({ username: email.trim(), password })
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginBody,
      })
      if (!loginResponse.ok) throw new Error('Đăng nhập thất bại. Kiểm tra email và mật khẩu Employee.')
      const login = await loginResponse.json() as { access_token: string; user: { name: string; role: string } }
      if (login.user.role !== 'employee') throw new Error('Chỉ tài khoản Employee được tạo Purchase Request.')

      const response = await fetch(`${API_URL}/purchase-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.access_token}` },
        body: JSON.stringify({
          title: title.trim(),
          department: dept,
          amount: amount * 1_000_000,
          category,
          justification: reason.trim(),
          requester: login.user.name,
        }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { detail?: string } | null
        throw new Error(body?.detail || `Backend trả về lỗi ${response.status}.`)
      }

      const saved = await response.json() as ApiRequest
      const created: Request = {
        id: saved.id,
        title: saved.title,
        department: saved.department,
        amount: saved.amount / 1_000_000,
        category: saved.category,
        reason: saved.justification,
        requester: saved.requester,
        status: 'Chờ Manager duyệt',
        step: 0,
        created: 'Vừa xong',
      }
      setRequests(items => [created, ...items])
      setTitle('')
      setReason('')
      setPassword('')
      setNotice(`${saved.id} đã được lưu và gửi đến Manager để phê duyệt.`)
    } catch (error) {
      setNotice(error instanceof Error ? `Không thể gửi yêu cầu: ${error.message}` : 'Không thể kết nối backend. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }
  function decide(id:string, ok:boolean) { setRequests(items => items.map(x => { if(x.id!==id) return x; if(!ok) return {...x,status:'Đã từ chối'}; const step=x.step+1; return step===3 ? {...x,step,status:'Đã phê duyệt'} : {...x,step,status:`Chờ ${stages[step]} duyệt`} })); setSelected(null) }
  return <main>
    <aside><div className="brand"><i>R</i><span>RoomFlow</span></div><div className="workspace">● PROCUREMENT WORKSPACE <b>⌄</b></div><nav><a className="selected" href="#overview">▦ <span>Tổng quan</span></a><a href="#request">＋ <span>Purchase Request</span></a><a href="#budget">◒ <span>Budget Control</span></a><a href="#approval">✓ <span>Approval Workflow</span></a></nav><div className="user"><i>MA</i><span><b>Minh Anh</b><small>Employee</small></span></div></aside>
    <div className="content" id="overview"><header><div><small>WORKSPACE / PROCUREMENT</small><h1>Chào buổi sáng, Minh Anh.</h1><p>Quản lý các yêu cầu mua sắm và quyết định phê duyệt trong một nơi.</p></div><button className="primary" onClick={() => document.querySelector('#request')?.scrollIntoView({behavior:'smooth'})}>＋ Tạo yêu cầu mới</button></header>
      <section className="metrics"><article><small>YÊU CẦU ĐANG XỬ LÝ</small><b>{active}</b><span>↗ 2 yêu cầu tuần này</span></article><article><small>NGÂN SÁCH KHẢ DỤNG</small><b>{money(budgets.reduce((a,x)=>a+x.limit-x.spent,0))}</b><span>Trong 3 phòng ban</span></article><article><small>THỜI GIAN DUYỆT TB.</small><b>1.8 ngày</b><span>↓ 24% so với tháng trước</span></article></section>
      <section id="request" className="panel"><div className="heading"><div><small>01 — PURCHASE REQUEST</small><h2>Tạo yêu cầu mua sắm</h2></div><p>Mọi yêu cầu bắt đầu từ một biểu mẫu nhất quán, có kiểm tra ngân sách.</p></div><form onSubmit={submit}><label className="wide">Tên yêu cầu<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="VD: Mua màn hình cho team thiết kế"/></label><label>Email Employee<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mật khẩu<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Phòng ban<select value={dept} onChange={e=>setDept(e.target.value)}>{budgets.map(x=><option key={x.name}>{x.name}</option>)}</select></label><label>Giá trị <em>(triệu VNĐ)</em><input type="number" min=".1" step=".5" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label><label>Danh mục<select value={category} onChange={e=>setCategory(e.target.value)}><option>Thiết bị công nghệ</option><option>Phần mềm & dịch vụ</option><option>Văn phòng phẩm</option><option>Marketing</option></select></label><label className="reason">Lý do mua<textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Mô tả nhu cầu, mục đích sử dụng và thời điểm cần..."/></label><div className="form-footer"><span>Đăng nhập bằng tài khoản Employee</span><button className="primary" type="submit" disabled={submitting}>{submitting?'Đang gửi…':'Gửi yêu cầu →'}</button></div></form>{notice&&<div className={`notice ${notice.startsWith('Ngân') || notice.startsWith('Không thể')?'danger':''}`} role="status">{notice}</div>}</section>
      <section id="budget" className="panel"><div className="heading"><div><small>02 — BUDGET CONTROL</small><h2>Kiểm tra ngân sách</h2></div><p>Kiểm soát chi tiêu trước khi yêu cầu đi vào luồng phê duyệt.</p></div><div className="budget-grid">{budgets.map(x=><article key={x.name}><div><b>{x.name}</b><span>{money(x.limit-x.spent)} còn lại</span></div><div className="bar"><i style={{width:`${x.spent/x.limit*100}%`}}/></div><small>Đã dùng {money(x.spent)} / {money(x.limit)}</small></article>)}</div><div className={`budget-check ${remaining>=0?'good':'bad'}`}><i>{remaining>=0?'✓':'!'}</i><div><b>{remaining>=0?'Trong ngân sách':'Vượt ngân sách'}</b><span>Yêu cầu mới: {money(amount)} · Còn lại sau yêu cầu: {money(remaining)}</span></div><small>{dept}</small></div></section>
      <section className="ai"><i>✦</i><div><small>ROOMFLOW AI · PRE-CHECK</small><h3>{title.trim()?`Tóm tắt: ${title}`:'Sẵn sàng hỗ trợ yêu cầu của bạn'}</h3><p>{title.trim()?`${category} cho ${dept}. AI đề xuất luồng Manager → Finance → Procurement.`:'Điền biểu mẫu để nhận tóm tắt, phân loại và đề xuất luồng phê duyệt.'}</p></div><b>{amount>(budget.limit-budget.spent)*.55?'Cần lưu ý':'Rủi ro thấp'}</b></section>
      <section id="approval" className="panel"><div className="heading"><div><small>03 — APPROVAL WORKFLOW</small><h2>Hàng đợi phê duyệt</h2></div><p>Luồng duyệt tự động: Manager → Finance → Procurement.</p></div><div className="request-list">{requests.map(x=><article key={x.id}><div><small>{x.id} · {x.department} · {x.created}</small><h3>{x.title}</h3><span>{x.category} · bởi {x.requester}</span></div><div className="workflow">{stages.map((stage,i)=><span className={x.status==='Đã từ chối'?'rejected':i<x.step?'done':i===x.step?'current':''} key={stage}><i>{i<x.step?'✓':i+1}</i>{stage}</span>)}</div><div className="actions"><b>{money(x.amount)}</b><small>{x.status}</small><div>{x.step<3&&x.status!=='Đã từ chối'&&<><button onClick={()=>decide(x.id,true)}>Duyệt</button><button className="reject" onClick={()=>decide(x.id,false)}>Từ chối</button></>}<button className="more" onClick={()=>setSelected(x)}>•••</button></div></div></article>)}</div></section></div>
    {selected&&<div className="backdrop" onClick={()=>setSelected(null)}><section className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><small>{selected.id} · {selected.category}</small><h2>{selected.title}</h2><p>{selected.reason}</p><div className="modal-row"><span>Người tạo <b>{selected.requester}</b></span><span>Giá trị <b>{money(selected.amount)}</b></span></div><h3>Lịch sử phê duyệt</h3>{stages.map((stage,i)=><div className="history" key={stage}><i className={i<selected.step?'done':''}>{i<selected.step?'✓':i+1}</i><span>{stage}</span><small>{i<selected.step?'Đã phê duyệt':i===selected.step?'Đang chờ xử lý':'Chờ bước trước'}</small></div>)}</section></div>}
  </main>
}
