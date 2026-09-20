import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { ProcurementProvider } from './contexts/ProcurementContext';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Requests } from './pages/Requests';
import { NewRequest } from './pages/NewRequest';
import { RequestDetail } from './pages/RequestDetail';
import { EditRequest } from './pages/EditRequest';

import { Approvals } from './pages/Approvals';
import { BudgetReview } from './pages/BudgetReview';

import { Sourcing } from './pages/Sourcing';
import { Comparison } from './pages/Comparison';
import { QuotationCollection } from './pages/QuotationCollection';
import { Suppliers } from './pages/Suppliers';

import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';

import { Assumptions } from './pages/Assumptions';
import { Login } from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';

export function App({ aiAssistEnabled = true }: { aiAssistEnabled?: boolean }) {
  return (
    <AuthProvider>
      <ProcurementProvider aiAssistEnabled={aiAssistEnabled}>
        <BrowserRouter>
          <Routes>

            {/* =========================
                LOGIN
            ========================= */}
            <Route path="/login" element={<Login />} />

            {/* =========================
                AUTHENTICATED USER
            ========================= */}
            <Route element={<ProtectedRoute />}>

              <Route element={<AppShell />}>

                {/* =========================
                    DASHBOARD
                ========================= */}
                <Route
                  path="/"
                  element={<Navigate to="/requests" replace />}
                />

                {/* =========================
                    EMPLOYEE
                ========================= */}

                {/* Xem Purchase Requests */}
                <Route
                  element={
                    <ProtectedRoute
                      roles={['employee', 'manager', 'finance', 'procurement', 'admin']}
                    />
                  }
                >
                  <Route
                    path="/requests"
                    element={<Requests />}
                  />

                  <Route
                    path="/requests/:id"
                    element={<RequestDetail />}
                  />
                </Route>

                {/* Chỉ Employee được tạo PR */}
                <Route
                  element={
                    <ProtectedRoute
                      roles={['employee', 'admin']}
                    />
                  }
                >
                  <Route
                    path="/requests/new"
                    element={<NewRequest />}
                  />

                  <Route
                    path="/requests/:id/edit"
                    element={<EditRequest />}
                  />
                </Route>

                {/* =========================
                    MANAGER
                ========================= */}

                <Route
                  element={
                    <ProtectedRoute
                      roles={['manager', 'admin']}
                    />
                  }
                >
                  <Route
                    path="/approvals"
                    element={<Approvals />}
                  />
                </Route>

                {/* =========================
                    FINANCE
                ========================= */}

                <Route
                  element={
                    <ProtectedRoute
                      roles={['finance', 'admin']}
                    />
                  }
                >
                  <Route
                    path="/budget"
                    element={<BudgetReview />}
                  />
                </Route>

                {/* =========================
                    PROCUREMENT
                ========================= */}

                <Route
                  element={
                    <ProtectedRoute
                      roles={['procurement', 'admin']}
                    />
                  }
                >
                  <Route
                    path="/sourcing"
                    element={<Sourcing />}
                  />

                  <Route
                    path="/sourcing/:id"
                    element={<Comparison />}
                  />

                  <Route
                    path="/sourcing/:id/collect"
                    element={<QuotationCollection />}
                  />

                  <Route
                    path="/suppliers"
                    element={<Suppliers />}
                  />

                  <Route
                    path="/orders"
                    element={<Orders />}
                  />

                  <Route
                    path="/orders/:id"
                    element={<OrderDetail />}
                  />
                </Route>

                {/* =========================
                    ASSUMPTIONS
                    Tất cả user đã đăng nhập đều xem được
                ========================= */}
                <Route
                  path="/assumptions"
                  element={<Assumptions />}
                />

                {/* =========================
                    FALLBACK
                ========================= */}
                <Route
                  path="*"
                  element={<Navigate to="/requests" replace />}
                />

              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </ProcurementProvider>
    </AuthProvider>
  );
}