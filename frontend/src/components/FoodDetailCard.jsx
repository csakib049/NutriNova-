import { useState } from 'react';
import { Apple, Beef, Fish, Milk, Salad, Wheat, Cookie, Bean, Leaf, Droplet, Egg, Utensils } from 'lucide-react';

const iconMap = {
  Apple, Beef, Fish, Milk, Salad, Wheat, Cookie, Bean, Leaf, Droplet, Egg, Utensils,
};

export default function FoodDetailCard({ food }) {
  const IconComponent = iconMap[food.icon] || Utensils;
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const showImage = Boolean(food.imageUrl) && !imgError;

  return (
    <div className="bg-surface p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      {showImage && (
        <div className={`relative -mx-6 -mt-6 mb-4 aspect-[16/9] overflow-hidden rounded-t-xl bg-surface-alt ${imgLoaded ? '' : 'animate-pulse'}`}>
          <img
            src={food.imageUrl}
            alt={food.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(false); }}
            className={`w-full h-full object-cover ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-brand-soft p-3 rounded-full">
          <IconComponent className="h-6 w-6 text-brand" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{food.name}</h3>
          <p className="text-sm text-muted capitalize">{food.category}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-alt p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-brand">{food.calories}</p>
          <p className="text-xs text-muted">Calories (kcal)</p>
        </div>
        <div className="bg-surface-alt p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-brand">{food.protein}g</p>
          <p className="text-xs text-muted">Protein</p>
        </div>
        <div className="bg-surface-alt p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-brand">{food.carbs}g</p>
          <p className="text-xs text-muted">Carbs</p>
        </div>
        <div className="bg-surface-alt p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-brand">{food.fat}g</p>
          <p className="text-xs text-muted">Fat</p>
        </div>
      </div>
      {food.servingSize && (
        <p className="text-xs text-muted mt-3 text-center">Per {food.servingSize}</p>
      )}
    </div>
  );
}
