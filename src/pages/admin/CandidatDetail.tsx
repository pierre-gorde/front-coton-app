import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export default function CandidatDetailPage() {
  const { candidatId } = useParams();
  
  return <PlaceholderPage title={`Le détail du candidat (${candidatId})`} />;
}
