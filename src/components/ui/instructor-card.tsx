import type { Instructor } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface InstructorCardProps {
  instructor: Instructor;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <Card className="cyber-card flex flex-col items-center text-center">
      <CardHeader className="items-center">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={instructor.profile_image} data-ai-hint="person photo" alt={instructor.name} />
          <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline">{instructor.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{instructor.bio}</CardDescription>
      </CardContent>
    </Card>
  );
}
