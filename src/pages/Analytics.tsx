
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  BarChart,
  Bar,
  CartesianGrid,
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from "recharts";

const Analytics = () => {
  // State for dynamic data
  const [monthlyAttackData, setMonthlyAttackData] = useState([]);
  const [attackTypesData, setAttackTypesData] = useState([]);
  const [globalComparisonData, setGlobalComparisonData] = useState([]);
  const [projectedAttacksData, setProjectedAttacksData] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch and initialize dynamic data
  useEffect(() => {
    // Simulate API call with setTimeout
    const fetchData = () => {
      // Data for India's recent cyber attacks
      const monthlyData = [
        { name: 'Jan', attacks: 350 },
        { name: 'Feb', attacks: 420 },
        { name: 'Mar', attacks: 510 },
        { name: 'Apr', attacks: 480 },
        { name: 'May', attacks: 530 },
        { name: 'Jun', attacks: 590 },
        { name: 'Jul', attacks: 620 },
        { name: 'Aug', attacks: 680 },
        { name: 'Sep', attacks: 710 },
        { name: 'Oct', attacks: 790 },
      ];

      // Types of attacks in India
      const attackTypes = [
        { name: 'Phishing', value: 32 },
        { name: 'Ransomware', value: 21 },
        { name: 'DDoS', value: 18 },
        { name: 'Data Breach', value: 15 },
        { name: 'Malware', value: 14 },
      ];

      // Global vs India comparison
      const globalComparison = [
        { name: 'Jan', india: 350, global: 5200 },
        { name: 'Feb', india: 420, global: 5400 },
        { name: 'Mar', india: 510, global: 5700 },
        { name: 'Apr', india: 480, global: 5900 },
        { name: 'May', india: 530, global: 6100 },
        { name: 'Jun', india: 590, global: 6300 },
        { name: 'Jul', india: 620, global: 6500 },
        { name: 'Aug', india: 680, global: 6800 },
        { name: 'Sep', india: 710, global: 7200 },
        { name: 'Oct', india: 790, global: 7600 },
      ];

      // Projected attacks for next 3 months
      const projectedAttacks = [
        { name: 'Nov', attacks: 850, projected: true },
        { name: 'Dec', attacks: 920, projected: true },
        { name: 'Jan', attacks: 980, projected: true },
      ];

      // Sector-wise attacks
      const sectors = [
        { name: 'Financial', value: 28 },
        { name: 'Healthcare', value: 22 },
        { name: 'Government', value: 19 },
        { name: 'IT/Tech', value: 15 },
        { name: 'Education', value: 11 },
        { name: 'Others', value: 5 },
      ];

      // Combine current and projected data for timeline chart
      const timeline = [
        ...monthlyData.slice(-5),
        ...projectedAttacks
      ];

      setMonthlyAttackData(monthlyData);
      setAttackTypesData(attackTypes);
      setGlobalComparisonData(globalComparison);
      setProjectedAttacksData(projectedAttacks);
      setSectorData(sectors);
      setTimelineData(timeline);
      setLoading(false);
    };

    // Simulate API delay
    setTimeout(fetchData, 1000);
  }, []);

  const recentAttacks = [
    {
      title: "Major Phishing Campaign",
      date: "October 15, 2023",
      description: "Large-scale phishing campaign targeting banking customers across major Indian cities."
    },
    {
      title: "Government Website DDoS",
      date: "October 8, 2023",
      description: "Several government websites experienced DDoS attacks causing temporary service disruptions."
    },
    {
      title: "Healthcare System Ransomware",
      date: "September 28, 2023",
      description: "Multiple hospitals in Delhi NCR targeted by coordinated ransomware attacks."
    },
    {
      title: "Critical Infrastructure Attack",
      date: "September 12, 2023",
      description: "Attempted breach of power grid systems in western India attributed to state-sponsored actors."
    }
  ];

  const predictedThreats = [
    {
      title: "AI-Powered Phishing",
      timeline: "November-December 2023",
      description: "Increased sophistication in phishing attacks using AI to generate convincing content."
    },
    {
      title: "Supply Chain Attacks",
      timeline: "December 2023",
      description: "Software supply chain attacks targeting IT service providers with large Indian client bases."
    },
    {
      title: "5G Network Exploitation",
      timeline: "Early 2024",
      description: "New attack vectors targeting vulnerabilities in emerging 5G infrastructure."
    },
    {
      title: "Deepfake-Based Social Engineering",
      timeline: "Q1 2024",
      description: "Rise in social engineering attacks using deepfake technology to impersonate executives."
    }
  ];

  // Colors for charts
  const COLORS = ['#6E59A5', '#0EA5E9', '#F97316', '#ea384c', '#10B981', '#8884d8'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cyber Threat Analytics - India</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">Recent Incidents</TabsTrigger>
          <TabsTrigger value="predictions">Threat Predictions</TabsTrigger>
          <TabsTrigger value="global">Global Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safinet-purple"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cyber Attacks in India (2023)</CardTitle>
                    <CardDescription>Monthly recorded incidents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyAttackData}>
                          <defs>
                            <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6E59A5" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#6E59A5" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="attacks" 
                            stroke="#6E59A5" 
                            fillOpacity={1} 
                            fill="url(#colorAttacks)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attack Types in India</CardTitle>
                    <CardDescription>Distribution by attack vector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={attackTypesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {attackTypesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Projected Cyber Attacks (Next 3 Months)</CardTitle>
                  <CardDescription>Current and forecasted incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="attacks" 
                          stroke="#6E59A5" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 8 }}
                          strokeDasharray={entry => entry.projected ? "5 5" : "0"} // Fix: This line is causing the error
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Targeted Sectors in India</CardTitle>
                  <CardDescription>Percentage of attacks by industry</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sectorData}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Percentage of Attacks" fill="#6E59A5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Significant Attacks in India</CardTitle>
              <CardDescription>Major cyber incidents in the past 60 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAttacks.map((attack, index) => (
                <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                  <h3 className="text-lg font-semibold">{attack.title}</h3>
                  <p className="text-sm text-muted-foreground">{attack.date}</p>
                  <p className="mt-2">{attack.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Attack Source by Country</CardTitle>
              <CardDescription>Origin of cyber attacks targeting Indian entities</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Country 1', value: 35 },
                      { name: 'Country 2', value: 25 },
                      { name: 'Country 3', value: 18 },
                      { name: 'Country 4', value: 12 },
                      { name: 'Others', value: 10 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Percentage of Attacks" fill="#0EA5E9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predicted Emerging Threats</CardTitle>
              <CardDescription>Anticipated cyber threats for upcoming months</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictedThreats.map((threat, index) => (
                <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                  <h3 className="text-lg font-semibold">{threat.title}</h3>
                  <p className="text-sm text-muted-foreground">Anticipated: {threat.timeline}</p>
                  <p className="mt-2">{threat.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Projected Attack Vectors</CardTitle>
              <CardDescription>Expected distribution of attack methods in next quarter</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'AI-Enhanced Phishing', value: 30 },
                        { name: 'Supply Chain', value: 25 },
                        { name: 'Zero-Day Exploits', value: 20 },
                        { name: 'Deepfakes', value: 15 },
                        { name: 'IoT Vulnerabilities', value: 10 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {attackTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="global" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safinet-purple"></div>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>India vs Global Cyber Attacks</CardTitle>
                  <CardDescription>Monthly comparison of attack volume</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={globalComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="india" 
                          name="India"
                          stroke="#6E59A5" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="global" 
                          name="Global (÷10)"
                          stroke="#0EA5E9" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Note: Global numbers are scaled down by factor of 10 for comparison purposes
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Growth Rate Comparison</CardTitle>
                  <CardDescription>Year-over-year increase in cyber attacks</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { year: '2019', india: 24, global: 18 },
                          { year: '2020', india: 29, global: 22 },
                          { year: '2021', india: 36, global: 27 },
                          { year: '2022', india: 42, global: 32 },
                          { year: '2023', india: 48, global: 36 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis label={{ value: 'Growth %', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="india" name="India" fill="#6E59A5" />
                        <Bar dataKey="global" name="Global Average" fill="#0EA5E9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
