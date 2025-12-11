import { useParams } from 'react-router-dom';
import { UnderConstruction } from '@/components/common/UnderConstruction';

export default function ClientDetailPage() {
  const { clientId } = useParams();
  
  return <UnderConstruction feature={`Le détail du client (${clientId})`} />;
}