import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  "data-testid"?: string;
}

export default function StarRating({ value, onChange, "data-testid": testId }: StarRatingProps) {
  return (
    <div className="flex items-center space-x-1" data-testid={testId}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= value;
        
        return (
          <Star
            key={index}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              isActive 
                ? "text-accent fill-accent" 
                : "text-muted-foreground hover:text-accent"
            }`}
            onClick={() => onChange(starValue)}
            data-testid={`${testId}-star-${starValue}`}
          />
        );
      })}
    </div>
  );
}
