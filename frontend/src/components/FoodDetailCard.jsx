import { Apple, Beef, Fish, Milk, Salad, Wheat, Cookie, Bean, Leaf, Droplet, Egg, Utensils } from 'lucide-react';

const iconMap = {
  Apple, Beef, Fish, Milk, Salad, Wheat, Cookie, Bean, Leaf, Droplet, Egg, Utensils,
};

export default function FoodDetailCard({ food }) {
  const IconComponent = iconMap[food.icon] || Utensils;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-100 p-3 rounded-full">
          <IconComponent className="h-6 w-6 text-green-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{food.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{food.category}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-green-700">{food.calories}</p>
          <p className="text-xs text-gray-500">Calories (kcal)</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-green-700">{food.protein}g</p>
          <p className="text-xs text-gray-500">Protein</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-green-700">{food.carbs}g</p>
          <p className="text-xs text-gray-500">Carbs</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-green-700">{food.fat}g</p>
          <p className="text-xs text-gray-500">Fat</p>
        </div>
      </div>
      {food.servingSize && (
        <p className="text-xs text-gray-400 mt-3 text-center">Per {food.servingSize}</p>
      )}
    </div>
  );
}
