import React, { useMemo } from 'react';
import { Badge } from '../../ui/badge';

// Assuming you are using the ProductFormData interface we created
interface DiscountPreviewProps {
  formData: {
    price: string | number;
    sellingPrice: string | number;
  };
}

export const DiscountPreview: React.FC<DiscountPreviewProps> = ({ formData }) => {
  // 1. Move logic out of JSX for readability
  const stats = useMemo(() => {
    const original = parseFloat(formData.price.toString()) || 0;
    const current = parseFloat(formData.sellingPrice.toString()) || 0;

    if (original <= 0 || current >= original) return null;

    const discountPercentage = Math.round(((original - current) / original) * 100);

    return {
      original: original.toFixed(2),
      current: current.toFixed(2),
      discount: discountPercentage,
    };
  }, [formData.price, formData.sellingPrice]);

  // 2. Conditional rendering based on calculated stats
  if (!stats) return null;

  return (
    <div className="p-3 bg-secondary rounded-lg border border-border">
      <p className="text-xs text-muted-foreground mb-1">Discount Preview</p>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-primary">
          ₹{stats.current}
        </span>
        <span className="text-sm text-muted-foreground line-through">
          ₹{stats.original}
        </span>
        <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5">
          {stats.discount}% OFF
        </Badge>
      </div>
    </div>
  );
};