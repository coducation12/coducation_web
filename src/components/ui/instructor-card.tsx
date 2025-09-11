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
      <CardHeader className="items-center pt-8 pb-4 px-6">
        <Avatar className="w-20 h-20 mb-4">
          <AvatarImage src={instructor.profile_image} data-ai-hint="person photo" alt={instructor.name} />
          <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline text-center text-lg mb-2">{instructor.name}</CardTitle>
        {instructor.bio && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
            {instructor.bio}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center px-6 pb-6">
        <CardDescription className="text-sm leading-relaxed text-center">
          {instructor.subject}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
