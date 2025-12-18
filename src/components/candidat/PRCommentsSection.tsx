/**
 * PR Comments Section Component
 * Displays GitHub PR review comments with fetch capability
 * Following CLAUDE.md patterns: proper state management, error handling with toasts
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, GitPullRequest, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PRReviewComment } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PRCommentsSectionProps {
  candidateId: string;
  reviewerUserId: string;
  comments?: PRReviewComment[];
  onCommentsLoaded: (comments: PRReviewComment[]) => void;
  disabled?: boolean;
}

export function PRCommentsSection({
  candidateId,
  reviewerUserId,
  comments = [],
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

      toast({
        title: 'Succès',
        description: `${fetchedComments.length} commentaire(s) récupéré(s)`,
        variant: 'success',
      });

      onCommentsLoaded(fetchedComments);
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
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Commentaires PR GitHub
            {comments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {comments.length}
              </Badge>
            )}
          </span>
        </div>
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

      {comments.length === 0 ? (
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            Aucun commentaire PR. Cliquez sur "Récupérer code reviews" pour charger les commentaires de ce reviewer.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="space-y-2">
                {/* PR Info Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={comment.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      #{comment.prNumber}: {comment.prTitle}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(comment.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>

                {/* File Path */}
                <div className="text-xs text-muted-foreground font-mono">
                  {comment.path}:{comment.line}
                </div>

                {/* Code Context (if available) */}
                {comment.code && (
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                    <code>{comment.code}</code>
                  </pre>
                )}

                {/* Comment Body */}
                <div className="text-sm whitespace-pre-wrap border-l-2 border-primary pl-3">
                  {comment.body}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
