'use client'

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img 
        src="/logo.png"
        alt="Blejta Logo" 
        width={50} 
        height={50}
        className="rounded-full object-contain"
        style={{ 
          display: 'block', 
          minWidth: '50px', 
          minHeight: '50px',
          flexShrink: 0
        }}
      />
      <span className="text-xl font-bold text-gray-900">Blejta</span>
    </div>
  )
}
