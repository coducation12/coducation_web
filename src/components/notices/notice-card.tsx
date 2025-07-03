import type { Notice } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface NoticeCardProps {
  notice: Notice;
}

export function NoticeCard({ notice }: NoticeCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-headline">{notice.title}</CardTitle>
            {notice.is_notice && <Badge variant="destructive">중요</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{notice.content}</p>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
            <span>{notice.author_name}</span> &middot; <span>{format(new Date(notice.created_at), 'yyyy-MM-dd')}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
