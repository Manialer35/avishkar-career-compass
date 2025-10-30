
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Import the MaterialAccess component
import MaterialAccessComponent from '@/components/MaterialAccess';

const MaterialAccess = () => {
  const { productId } = useParams();
  const location = useLocation();
  const purchaseSuccess = location.state?.purchaseSuccess || false;
  const productName = location.state?.productName || '';
  
  return <MaterialAccessComponent productId={productId} purchaseSuccess={purchaseSuccess} productName={productName} />;
};

export default MaterialAccess;
