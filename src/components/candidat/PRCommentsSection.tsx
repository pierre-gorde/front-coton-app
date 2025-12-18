/**
 * PR Comments Section Component
 * Displays GitHub PR review comments with fetch capability
 * Following CLAUDE.md patterns: proper state management, error handling with toasts
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GitPullRequest, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PRCommentsSectionProps {
  candidateId: string;
  reviewerUserId: string;
  comments?: string;
  onCommentsLoaded: (comments: string) => void;
  disabled?: boolean;
}

export function PRCommentsSection({
  candidateId,
  reviewerUserId,
  comments = '',
  onCommentsLoaded,
  disabled = false,
}: PRCommentsSectionProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchComments = async () => {
    try {
      setIsLoading(true);

      // Import dynamically to avoid circular dependencies
      const { fetchPRCommentsByReviewer } = await import('@/lib/services/githubService');

      const fetchedComments = await fetchPRCommentsByReviewer(candidateId, reviewerUserId);

      // Convert array of comment objects to formatted string
      const formattedComments = fetchedComments
        .map((comment) => {
          return `PR #${comment.prNumber}: ${comment.prTitle}\n${comment.path}:${comment.line}\n${comment.body}\n`;
        })
        .join('\n---\n\n');

      toast({
        title: 'Succès',
        description: `${fetchedComments.length} commentaire(s) récupéré(s)`,
        variant: 'success',
      });

      onCommentsLoaded(formattedComments);
    } catch (error) {
      console.error('Failed to fetch PR comments:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les commentaires GitHub',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="prComments" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Commentaires PR GitHub</span>
        </Label>
        <Button
          size="sm"
          variant="outline"
          onClick={handleFetchComments}
          disabled={isLoading || disabled}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <GitPullRequest className="h-4 w-4 mr-2" />
              Récupérer code reviews
            </>
          )}
        </Button>
      </div>

      {!comments ? (
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            Aucun commentaire PR. Cliquez sur "Récupérer code reviews" pour charger les commentaires de ce reviewer.
          </AlertDescription>
        </Alert>
      ) : (
        <Textarea
          id="prComments"
          value={comments}
          readOnly
          rows={8}
          className="font-mono text-xs"
          placeholder="Les commentaires PR apparaîtront ici..."
        />
      )}
    </div>
  );
}
