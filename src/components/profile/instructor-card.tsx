import type { Instructor } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface InstructorCardProps {
  instructor: Instructor;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <Card className="flex flex-col items-center text-center">
      <CardHeader>
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={instructor.profile_image} data-ai-hint="person photo" alt={instructor.name} />
          <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline">{instructor.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{instructor.bio}</CardDescription>
      </CardContent>
      <CardFooter>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="w-4 h-4 mr-2" />
          <span>담당 학생: {instructor.assigned_students_count}명</span>
        </div>
      </CardFooter>
    </Card>
  );
}
