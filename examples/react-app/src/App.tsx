import { WsdlWeb } from 'wsdl-web'
import 'wsdl-web/style.css'

export default function App() {
  return (
    <WsdlWeb
      url="https://example.com/my-service?wsdl"
    />
  )
}
