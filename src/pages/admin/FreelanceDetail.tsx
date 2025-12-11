import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export default function FreelanceDetailPage() {
  const { userId } = useParams();
  
  return <PlaceholderPage title={`Le détail du freelance (${userId})`} />;
}
