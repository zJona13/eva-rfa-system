
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to dashboard or login page
  return <Navigate to="/login" replace />;
};

export default Index;
