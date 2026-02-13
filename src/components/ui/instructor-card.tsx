import type { Instructor } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface InstructorCardProps {
  instructor: Instructor;
  onClick?: () => void;
}

export function InstructorCard({ instructor, onClick }: InstructorCardProps) {
  return (
    <Card
      className="cyber-card flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg w-full h-full"
      onClick={onClick}
    >
      <CardHeader className="items-center pt-4 md:pt-8 pb-2 md:pb-4 px-4 md:px-6 flex-grow flex flex-col justify-center">
        <Avatar className="w-16 h-16 md:w-20 md:h-20 mb-2 md:mb-4">
          <AvatarImage src={instructor.profile_image} data-ai-hint="person photo" alt={instructor.name} />
          <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline text-center text-base md:text-lg mb-0 md:mb-2">{instructor.name}</CardTitle>
        {/* 모바일에서는 bio와 subject 숨김 */}
        <div className="hidden md:block">
          {instructor.position && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1 mt-2">
              {instructor.position}
            </Badge>
          )}
        </div>
      </CardHeader>
      {/* 모바일에서는 CardContent 숨김 */}
      <CardContent className="hidden md:flex flex-grow items-center justify-center px-6 pb-6">
        <CardDescription className="text-sm leading-relaxed text-center">
          {instructor.subject}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
