import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = await login(email, password)

      if (!result.ok) {
        setError(result.message || 'Đăng nhập thất bại.')
        return
      }

      const from = location.state?.from?.pathname

      if (from) {
        navigate(from, { replace: true })
        return
      }

      navigate('/requests', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-line rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink">
              Procurement System
            </h1>

            <p className="text-sm text-ink-muted mt-2">
              Đăng nhập vào hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="admin@demo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Mật khẩu
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="123456"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-600 text-white py-2.5 font-medium hover:bg-brand-700 transition"
            >
              {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-600">
            <p className="font-semibold mb-2">Tài khoản demo</p>
            <p>Admin: admin@demo.com / 123456</p>
            <p>Employee: employee@demo.com / 123456</p>
            <p>Manager: manager@demo.com / 123456</p>
            <p>Finance: finance@demo.com / 123456</p>
            <p>Procurement: procurement@demo.com / 123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}
