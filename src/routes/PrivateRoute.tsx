import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import type { ReactElement } from 'react'

interface Props {
  children: ReactElement
}

export function PrivateRoute({ children }: Props) {
  const isAuth = useAppSelector((state) => state.auth.isAuthenticated)
  return isAuth ? children : <Navigate to="/" replace />
}
