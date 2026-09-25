# Security + NFR Evidence

## 1. RBAC

### Role & Permission

| Role | Approval |
|---|---:|
| Employee | ✗ |
| Manager | ✓ |
| Finance | ✗ |
| Procurement | ✗ |
| Admin | Theo permission |

### Backend Authorization

Approval API được bảo vệ bằng:

```python
Depends(require_roles("manager"))
