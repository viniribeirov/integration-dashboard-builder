
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  // Redireciona automaticamente para o dashboard
  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  // Este componente não renderiza nada, pois apenas faz redirecionamento
  return null;
};

export default Index;
