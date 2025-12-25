import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

import MaterialAccessComponent from '@/components/MaterialAccess';

const MaterialAccess = () => {
  const { materialId } = useParams();
  const location = useLocation();

  const purchaseSuccess = location.state?.purchaseSuccess || false;
  const productName = location.state?.productName || '';

  // Route is /material/:materialId/access but the component prop is named productId.
  // Pass materialId through to keep existing component API unchanged.
  return (
    <MaterialAccessComponent
      productId={materialId}
      purchaseSuccess={purchaseSuccess}
      productName={productName}
    />
  );
};

export default MaterialAccess;
