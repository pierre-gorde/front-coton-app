import { useParams } from 'react-router-dom';
import { UnderConstruction } from '@/components/common/UnderConstruction';

export default function FreelanceDetailPage() {
  const { userId } = useParams();
  
  return <UnderConstruction feature={`Le détail du freelance (${userId})`} />;
}