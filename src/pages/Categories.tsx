import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockCategories } from '@/mock/calendar';

export default function Categories() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#FFF9FB] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100 mr-4"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-medium text-gray-800">分类管理</h1>
        </div>

        <div className="space-y-4">
          {mockCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-lg font-medium text-gray-800">
                  {category.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}