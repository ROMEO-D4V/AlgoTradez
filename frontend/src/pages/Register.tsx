import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  Mail,
  User,
  Lock,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showToast } from '@/utils/toast'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const csrfResponse = await fetch('/auth/csrf-token', {
        credentials: 'include',
      })
      const csrfData = await csrfResponse.json()

      const response = await fetch('/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfData.csrf_token,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.status === 'success') {
        showToast.success('Account created successfully! Please sign in.')
        navigate('/login')
      } else {
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch (_err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 bg-black relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float-patch" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-float-patch-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/2 rounded-full blur-3xl animate-float-patch-3" />
        {/* Decorative floating orbs */}
        <div className="floating-orb w-32 h-32 top-[15%] right-[10%]" style={{ animationDelay: '0s' }} />
        <div className="floating-orb w-24 h-24 bottom-[25%] left-[15%]" style={{ animationDelay: '3s' }} />
        <div className="floating-orb w-20 h-20 top-[50%] left-[10%]" style={{ animationDelay: '6s' }} />
      </div>

      <div className="container max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Register Form */}
          <Card className="w-full max-w-md order-1 lg:order-2 shadow-2xl border-white/20 bg-black/80 backdrop-blur-xl glass-card shimmer-overlay">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <img src="/images/stockx-logo.svg" alt="STOCKX TRADEZ" className="h-20 w-20 animate-logo-glow" />
              </div>
              <CardTitle className="text-2xl text-white text-glow-intense letter-stagger">
                {'Create Account'.split('').map((letter, i) => (
                  <span key={i} className="inline-block animate-letter" style={{ animationDelay: `${i * 0.05}s` }}>
                    {letter === ' ' ? '\u00A0' : letter}
                  </span>
                ))}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Join STOCKX TRADEZ and start trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      autoComplete="username"
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/50 focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      autoComplete="email"
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/50 focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/50 focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/50 focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-white hover:text-gray-300 font-medium underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Content */}
          <div className="flex-1 max-w-xl text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-white text-glow">
              Join <span className="text-white">STOCKX TRADEZ</span>
            </h1>
            <p className="text-lg lg:text-xl mb-8 text-gray-400">
              Create your account and start your journey with AI-powered algorithmic trading.
              Access advanced tools, real-time data, and smart trading strategies.
            </p>

            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                  <span className="text-white font-bold">1</span>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">Create your free account</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                  <span className="text-white font-bold">2</span>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">Connect your broker</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                  <span className="text-white font-bold">3</span>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors">Start trading with AI assistance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}