import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const reviews = [
  {
    id: '1',
    author: '김민준',
    avatar: '/images/avatars/student1.jpg',
    course: '파이썬 기초 과정',
    content: '코딩을 처음 배우는데 정말 재미있게 가르쳐주세요! 선생님이 친절하고 이해하기 쉽게 설명해주셔서 좋았습니다.',
    rating: 5
  },
  {
    id: '2',
    author: '이지은',
    avatar: '/images/avatars/student2.jpg',
    course: '웹 개발 과정',
    content: '실무에서 바로 쓸 수 있는 기술들을 배워서 정말 유용했어요. 프로젝트도 함께 만들어보면서 실력이 많이 늘었습니다.',
    rating: 5
  },
  {
    id: '3',
    author: '박현우',
    avatar: '/images/avatars/student3.jpg',
    course: '알고리즘 과정',
    content: '수학적 사고력이 많이 향상되었어요. 문제를 해결하는 과정이 재미있고, 선생님이 항상 격려해주셔서 자신감이 생겼습니다.',
    rating: 5
  },
  {
    id: '4',
    author: '최수진',
    avatar: '/images/avatars/student4.jpg',
    course: '게임 개발 과정',
    content: '게임을 만드는 과정이 정말 신기했어요! 스크래치부터 시작해서 점점 복잡한 게임을 만들 수 있게 되었습니다.',
    rating: 5
  }
];

export function ReviewsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 glitch-heading" data-text="학생들의 후기">
            학생들의 후기
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            실제 수강생들의 생생한 후기를 확인해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="cyber-card group">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="w-12 h-12 mr-3">
                    <AvatarImage src={review.avatar} alt={review.author} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {review.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{review.author}</h4>
                    <p className="text-sm text-muted-foreground">{review.course}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{review.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm">더 많은 후기는 로그인 후 확인하실 수 있습니다</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
