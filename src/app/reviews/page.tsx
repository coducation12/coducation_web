import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Review } from '@/types';
import { Star } from 'lucide-react';

const mockReviews: Review[] = [
  {
    id: '1',
    author: '김민준 학생',
    avatar: 'https://placehold.co/100x100.png',
    course: '파이썬 기초',
    content: '코딩이 이렇게 재미있는 건지 처음 알았어요! 선생님께서 정말 쉽게 가르쳐주셔서 포기하지 않고 끝까지 할 수 있었습니다.',
  },
  {
    id: '2',
    author: '이서연 학부모',
    avatar: 'https://placehold.co/100x100.png',
    course: '웹 개발 중급',
    content: '아이가 학원에 다녀온 날이면 항상 신나서 그날 배운 내용을 설명해줘요. 스스로 무언가를 만들어내는 모습이 정말 대견합니다.',
  },
  {
    id: '3',
    author: '박지훈 학생',
    avatar: 'https://placehold.co/100x100.png',
    course: 'Unity 게임 개발',
    content: '제가 상상했던 게임을 직접 만들 수 있다는 게 믿기지 않아요. Coducation은 제 꿈을 현실로 만들어주는 곳이에요!',
  },
  {
    id: '4',
    author: '최은아 학부모',
    avatar: 'https://placehold.co/100x100.png',
    course: '파이썬 기초',
    content: '체계적인 커리큘럼과 꼼꼼한 관리 덕분에 아이의 실력이 눈에 띄게 늘었어요. 상담도 친절하게 잘 해주셔서 믿음이 갑니다.',
  },
];

const StarRating = ({ rating = 5 }: { rating?: number }) => (
    <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ))}
    </div>
)

export default function ReviewsPage() {
  return (
    <div className="container py-12 md:py-24 lg:py-32">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">생생한 학습 후기</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          학생과 학부모님들이 직접 경험한 Coducation의 이야기를 들어보세요.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {mockReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={review.avatar} data-ai-hint="person portrait" alt={review.author} />
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-sm text-muted-foreground">{review.course} 수강</p>
                    </div>
                    <div className="ml-auto">
                        <StarRating />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic">"{review.content}"</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
