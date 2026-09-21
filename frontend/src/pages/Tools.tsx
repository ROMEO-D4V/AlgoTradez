import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { tools } from '@/lib/tools'

export default function Tools() {
  return (
    <div className="py-6 space-y-6" style={{ background: '#000000', minHeight: '100vh' }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold glow-heading">Tools</h1>
        <p className="text-gray-500 mt-1">
          Analytical tools for options trading and market analysis
        </p>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link key={tool.href} to={tool.href}>
            <Card className="h-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 cursor-pointer group hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                    <span className="text-gray-400 font-bold text-sm">
                      {tool.title
                        .split(' ')
                        .map((w) => w[0])
                        .join('')}
                    </span>
                  </div>
                </div>
                <CardTitle className="flex items-center gap-2 text-white group-hover:text-profit transition-colors text-sm">
                  {tool.title}
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription className="text-gray-500 text-xs">{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-600">Click to open {tool.title}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
