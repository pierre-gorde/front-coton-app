import { useParams } from 'react-router-dom';
import { UnderConstruction } from '@/components/common/UnderConstruction';

export default function CheckDetailPage() {
  const { checkId } = useParams();
  
  return <UnderConstruction feature={`Le détail du poste (${checkId})`} />;
}