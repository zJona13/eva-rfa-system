import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalColaboradores: number;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:3309/api/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Resumen de Datos',
      },
    },
  };

  const labels = ['Usuarios', 'Roles', 'Colaboradores'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Cantidad',
        data: [dashboardData?.totalUsers || 0, dashboardData?.totalRoles || 0, dashboardData?.totalColaboradores || 0],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Totales</CardTitle>
              <CardDescription>Número total de usuarios registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios Activos</CardTitle>
              <CardDescription>Número de usuarios actualmente activos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Roles Totales</CardTitle>
              <CardDescription>Número total de roles definidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalRoles}</div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>Colaboradores Totales</CardTitle>
              <CardDescription>Número total de colaboradores registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalColaboradores}</div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Gráfico de Datos</CardTitle>
              <CardDescription>Representación gráfica de los datos del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Bar options={options} data={data} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
