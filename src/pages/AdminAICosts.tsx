import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Zap, TrendingUp, Users } from 'lucide-react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';

const AdminAICosts = () => {
  // Fetch cost overview
  const { data: overview } = useQuery({
    queryKey: ['ai_cost_overview'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_ai_cost_overview');
      if (error) throw error;
      return data[0];
    },
  });

  // Fetch cost by model
  const { data: modelCosts } = useQuery({
    queryKey: ['cost_by_model'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_cost_by_model');
      if (error) throw error;
      return data;
    },
  });

  // Fetch daily trends
  const { data: dailyTrends } = useQuery({
    queryKey: ['daily_cost_trends'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_cost_trends');
      if (error) throw error;
      return data.map(item => ({
        ...item,
        date: format(new Date(item.date), 'MMM dd'),
        total_cost: Number(item.total_cost)
      }));
    },
  });

  // Fetch top spenders
  const { data: topSpenders } = useQuery({
    queryKey: ['top_spenders'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_top_spenders');
      if (error) throw error;
      return data;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const chartConfig = {
    total_cost: {
      label: "Cost",
      color: "hsl(var(--primary))",
    },
    test_count: {
      label: "Tests",
      color: "hsl(var(--secondary))",
    },
  };

  const pieColors = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    'hsl(var(--destructive))',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Costs Dashboard</h1>
        <p className="text-muted-foreground">Monitor and analyze AI usage costs across all features</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs (All Time)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview ? formatCurrency(Number(overview.total_cost_all_time)) : '$0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview ? formatCurrency(Number(overview.total_cost_this_month)) : '$0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview ? overview.total_tests_all_time.toLocaleString() : '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Test</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview ? formatCurrency(Number(overview.average_cost_per_test)) : '$0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Cost Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Cost Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrends}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="total_cost" 
                    stroke="var(--color-total_cost)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Cost by Model */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelCosts}>
                  <XAxis dataKey="model_name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total_cost" fill="var(--color-total_cost)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Model Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelCosts}
                    dataKey="total_tests"
                    nameKey="model_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ model_name, value }) => `${model_name}: ${value}`}
                  >
                    {modelCosts?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Spenders */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSpenders?.slice(0, 5).map((spender, index) => (
                <div key={spender.user_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{spender.user_email}</p>
                      <p className="text-xs text-muted-foreground">{spender.test_count} tests</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(Number(spender.total_cost))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance & Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Model</th>
                  <th className="text-right p-2">Total Cost</th>
                  <th className="text-right p-2">Tests</th>
                  <th className="text-right p-2">Avg Cost</th>
                  <th className="text-right p-2">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {modelCosts?.map((model) => (
                  <tr key={model.model_name} className="border-b">
                    <td className="p-2 font-medium">{model.model_name}</td>
                    <td className="p-2 text-right">{formatCurrency(Number(model.total_cost))}</td>
                    <td className="p-2 text-right">{model.total_tests.toLocaleString()}</td>
                    <td className="p-2 text-right">{formatCurrency(Number(model.average_cost))}</td>
                    <td className="p-2 text-right">{model.total_tokens.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAICosts;