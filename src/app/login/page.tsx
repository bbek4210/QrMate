'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'


export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const { login, signup } = useAuth()
  const router = useRouter()



  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    full_name: '',
    profile: {
      bio: ''
    }
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(loginData.email, loginData.password)
      if (success) {
        router.push('/')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await signup(signupData)
      if (success) {
        // After successful signup, switch to login tab
        setIsLogin(true)
        // Clear signup form
        setSignupData({
          email: '',
          password: '',
          full_name: '',
          profile: {
            bio: ''
          }
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#232223] p-4">
      <div className="w-full max-w-md bg-[#2A2A2A] rounded-lg shadow-lg border border-gray-700">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Welcome to QR Mate
            </h2>
            <p className="text-sm text-gray-300 mt-2">
              Connect with people through QR codes
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex mb-6 bg-[#1A1A1A] rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin 
                  ? 'bg-[#ED2944] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin 
                  ? 'bg-[#ED2944] text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {isLogin && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="text-white font-medium">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]"
                />
              </div>
                             <div>
                 <Label htmlFor="login-password" className="text-white font-medium">Password</Label>
                 <div className="relative">
                   <Input
                     id="login-password"
                     type={showLoginPassword ? "text" : "password"}
                     required
                     value={loginData.password}
                     onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                     placeholder="Enter your password"
                     className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944] pr-10"
                   />
                   <button
                     type="button"
                     onClick={() => setShowLoginPassword(!showLoginPassword)}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                   >
                     {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                   </button>
                 </div>
               </div>
              <Button
                type="submit"
                className="w-full bg-[#ED2944] hover:bg-[#d4253a] text-white font-semibold py-3 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {!isLogin && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-full-name" className="text-white font-medium">Full Name</Label>
                <Input
                  id="signup-full-name"
                  type="text"
                  required
                  value={signupData.full_name}
                  onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]"
                />
              </div>
              <div>
                <Label htmlFor="signup-email" className="text-white font-medium">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  required
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944]"
                />
              </div>
                             <div>
                 <Label htmlFor="signup-password" className="text-white font-medium">Password</Label>
                 <div className="relative">
                   <Input
                     id="signup-password"
                     type={showSignupPassword ? "text" : "password"}
                     required
                     value={signupData.password}
                     onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                     placeholder="Enter your password"
                     className="text-black bg-white border-gray-300 focus:border-[#ED2944] focus:ring-[#ED2944] pr-10"
                   />
                   <button
                     type="button"
                     onClick={() => setShowSignupPassword(!showSignupPassword)}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                   >
                     {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                   </button>
                 </div>
               </div>
              
              <Button
                type="submit"
                className="w-full bg-[#ED2944] hover:bg-[#d4253a] text-white font-semibold py-3 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 