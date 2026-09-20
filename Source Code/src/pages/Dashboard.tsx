import React from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardListIcon,
  GavelIcon,
  WalletIcon,
  ScaleIcon,
  TruckIcon,
  PackageIcon,
  UsersIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface DashboardItem {
  title: string
  description: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const ROLE_LABELS = {
  admin: 'Administrator',
  employee: 'Employee',
  manager: 'Manager',
  finance: 'Finance',
  procurement: 'Procurement',
}

const ROLE_ITEMS: Record<string, DashboardItem[]> = {
  admin: [
    {
      title: 'Purchase Requests',
      description: 'Xem và quản lý toàn bộ yêu cầu mua hàng.',
      path: '/requests',
      icon: ClipboardListIcon,
    },
    {
      title: 'Approvals',
      description: 'Theo dõi các yêu cầu cần phê duyệt.',
      path: '/approvals',
      icon: GavelIcon,
    },
    {
      title: 'Budget',
      description: 'Theo dõi và kiểm tra ngân sách.',
      path: '/budget',
      icon: WalletIcon,
    },
    {
      title: 'Sourcing',
      description: 'Quản lý sourcing và báo giá.',
      path: '/sourcing',
      icon: ScaleIcon,
    },
    {
      title: 'Suppliers',
      description: 'Quản lý nhà cung cấp.',
      path: '/suppliers',
      icon: TruckIcon,
    },
    {
      title: 'Purchase Orders',
      description: 'Theo dõi purchase orders.',
      path: '/orders',
      icon: PackageIcon,
    },
  ],

  employee: [
    {
      title: 'My Purchase Requests',
      description: 'Xem các yêu cầu mua hàng của bạn.',
      path: '/requests',
      icon: ClipboardListIcon,
    },
    {
      title: 'Create Purchase Request',
      description: 'Tạo yêu cầu mua hàng mới.',
      path: '/requests/new',
      icon: ClipboardListIcon,
    },
  ],

  manager: [
    {
      title: 'My Purchase Requests',
      description: 'Xem các yêu cầu mua hàng.',
      path: '/requests',
      icon: ClipboardListIcon,
    },
    {
      title: 'Approval',
      description: 'Xử lý các yêu cầu đang chờ phê duyệt.',
      path: '/approvals',
      icon: GavelIcon,
    },
  ],

  finance: [
    {
      title: 'Purchase Requests',
      description: 'Theo dõi các yêu cầu mua hàng.',
      path: '/requests',
      icon: ClipboardListIcon,
    },
    {
      title: 'Budget Check',
      description: 'Kiểm tra và xử lý ngân sách.',
      path: '/budget',
      icon: WalletIcon,
    },
    {
      title: 'Quotations',
      description: 'Xem thông tin báo giá.',
      path: '/sourcing',
      icon: ScaleIcon,
    },
    {
      title: 'Purchase Orders',
      description: 'Theo dõi purchase orders.',
      path: '/orders',
      icon: PackageIcon,
    },
  ],

  procurement: [
    {
      title: 'Purchase Requests',
      description: 'Theo dõi các yêu cầu đã được phê duyệt.',
      path: '/requests',
      icon: ClipboardListIcon,
    },
    {
      title: 'Sourcing & Quotations',
      description: 'Quản lý sourcing và thu thập báo giá.',
      path: '/sourcing',
      icon: ScaleIcon,
    },
    {
      title: 'Suppliers',
      description: 'Quản lý nhà cung cấp.',
      path: '/suppliers',
      icon: TruckIcon,
    },
    {
      title: 'Purchase Orders',
      description: 'Quản lý purchase orders.',
      path: '/orders',
      icon: PackageIcon,
    },
  ],
}

export function Dashboard() {
  const { user } = useAuth()

  if (!user) return null

  const items = ROLE_ITEMS[user.role] ?? []

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-ink-muted">Dashboard</p>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-ink">
            Xin chào, {user.name}
          </h1>

          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            {ROLE_LABELS[user.role]}
          </span>
        </div>

        <p className="mt-2 text-sm text-ink-muted">
          Đây là khu vực làm việc dành cho vai trò {ROLE_LABELS[user.role]}.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className="group rounded-xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-sm font-semibold text-ink group-hover:text-brand-700">
                {item.title}
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {item.description}
              </p>
            </Link>
          )
        })}
      </section>

      {user.role === 'admin' && (
        <section className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-5 w-5 text-brand-700" />

            <div>
              <h2 className="text-sm font-semibold text-ink">
                Administrator Access
              </h2>

              <p className="mt-1 text-sm text-ink-muted">
                Admin có quyền truy cập các khu vực của toàn bộ hệ thống.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}