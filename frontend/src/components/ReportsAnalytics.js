import React from 'react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, Legend, LabelList,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

const ReportsAnalytics = ({ 
  residents = [], 
  ageData = [], 
  colors_age = ['#51a2d7', '#f39c12', '#e74c3c', '#2ecc71'],
  colors = ['#51a2d7', '#3790c0', '#2d7bad', '#206b9a', '#155987']
}) => {
  // Calculate gender distribution
  const genderGroups = residents.reduce((acc, resident) => {
    acc[resident.gender] = (acc[resident.gender] || 0) + 1;
    return acc;
  }, {});

  const genderChartData = Object.entries(genderGroups).map(([gender, count], index) => ({
    name: gender,
    value: count,
    color: colors[index % colors.length],
  }));

// 1. Income Distribution
const incomeRanges = [
  { range: '0-10k', min: 0, max: 10000 },
  { range: '10k-20k', min: 10001, max: 20000 },
  { range: '20k-30k', min: 20001, max: 30000 },
  { range: '30k-50k', min: 30001, max: 50000 },
  { range: '50k+', min: 50001, max: Infinity }
];

const incomeData = incomeRanges.map(range => {
  const count = residents.filter(r => 
    r.monthlyIncome >= range.min && r.monthlyIncome <= range.max
  ).length;
  
  return {
    name: range.range,
    value: count,
    color: colors[incomeRanges.indexOf(range) % colors.length]
  };
});

//  Education vs. Income

  
const educIncomeData = residents.map(r => ({
  education: r.educationLevel,
  income: r.monthlyIncome,
  age: r.age
}));

// 3. Employment Status Breakdown
const employmentGroups = residents.reduce((acc, resident) => {
  acc[resident.employmentStatus] = (acc[resident.employmentStatus] || 0) + 1;
  return acc;
}, {});

const employmentChartData = Object.entries(employmentGroups).map(([status, count], index) => ({
  name: status,
  value: count,
  color: colors[index % colors.length],
}));



  return (
    <div>
      <h2>Data Visualization</h2>
      <div className='chart-container'>
        {/* Age Distribution Chart */}
        <div>
          <h3>Resident Age Distribution</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={ageData}
                margin={{ top: 30, right: 30, bottom: 50, left: 40 }}
              >
                <XAxis 
                  dataKey="name" 
                  label={{ value: 'Ages', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  label={{ value: 'No. of Residents', angle: -90, position: 'insideLeft' }} 
                  tickCount={7} 
                  allowDecimals={false} 
                  domain={[0, 'dataMax']}
                />
                <Tooltip />
                <Bar dataKey="value" barSize={40} radius={[10, 10, 0, 0]}>
                  {ageData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors_age[index % colors_age.length]} 
                    />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    fill="#000" 
                    fontSize={12} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution Chart */}
        <div>
          <h3>Resident Gender Distribution</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {genderChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right" 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className='chart-container'>
        {/* 1. Income Distribution */}
        <div>
          <h3>Monthly Income Distribution</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={incomeData}
                margin={{ top: 30, right: 30, bottom: 50, left: 40 }}
              >
                <XAxis 
                  dataKey="name" 
                  label={{ value: 'Income Range', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  label={{ value: 'No. of Residents', angle: -90, position: 'insideLeft' }} 
                  tickCount={7} 
                  allowDecimals={false} 
                  domain={[0, 'dataMax']}
                />
                <Tooltip />
                <Bar dataKey="value" barSize={40} radius={[10, 10, 0, 0]}>
                  {incomeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    fill="#000" 
                    fontSize={12} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      <div>
          <h3>Education Level vs. Monthly Income</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 80, left: 70 }}
              >
                <XAxis 
                  type="category" 
                  dataKey="education" 
                  name="Education Level"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  type="number" 
                  dataKey="income" 
                  name="Monthly Income" 
                  label={{ value: 'Monthly Income', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="age" 
                  range={[50, 400]} 
                  name="Age" 
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Education vs. Income" data={educIncomeData} fill="#8884d8" />
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className='chart-container'>
        {/* 3. Employment Status Breakdown */}
        <div>
          <h3>Employment Status</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={employmentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {employmentChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;