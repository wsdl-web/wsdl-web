import { Badge } from '@/components/ui/badge'
import type { SoapVersion, BindingStyle } from '@/lib/wsdl/types'

interface SoapBadgeProps {
  soapVersion: SoapVersion
  style: BindingStyle
}

export function SoapBadge({ soapVersion, style }: SoapBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Badge className="bg-violet-600 hover:bg-violet-600 text-white text-[10px] px-1.5 py-0 font-bold uppercase tracking-wider">
        SOAP {soapVersion}
      </Badge>
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase tracking-wider">
        {style}
      </Badge>
    </div>
  )
}
