import { useParams } from 'react-router-dom';
import { UnderConstruction } from '@/components/common/UnderConstruction';

export default function CandidatDetailPage() {
  const { candidatId } = useParams();
  
  return <UnderConstruction feature={`Le détail du candidat (${candidatId})`} />;
}