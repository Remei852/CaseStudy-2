import React, { useEffect, useRef } from 'react';
import { Users, CheckCircle, UserCheck } from 'lucide-react';
import { Pie, Bar} from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = ({
  residents = [],
  logs = []
}) => {
  // Create a reference to store chart instances
  const chartRefs = useRef({});

  // Calculate employment status
  const getEmploymentStatus = () => {
    const employed = residents.filter(resident => resident?.employmentStatus === 'Employed').length;
    const unemployed = residents.filter(resident => resident?.employmentStatus === 'Unemployed').length;
    const selfEmployed = residents.filter(resident => resident?.employmentStatus === 'Self-Employed').length;
    const retired = residents.filter(resident => resident?.employmentStatus === 'Retired').length;
    const student = residents.filter(resident => resident?.employmentStatus === 'Student').length;
    return { employed, unemployed, selfEmployed, retired, student };
  };

  // Get number of residents, voters, and senior citizens
  const getResidentStats = () => {
    const totalResidents = residents.length || 0;
    const totalVoters = residents.filter(resident => resident?.voter === 'yes').length || 0;
    const totalSeniorCitizens = residents.filter(resident => resident?.senior === 'yes').length || 0;
  
    return { totalResidents, totalVoters, totalSeniorCitizens };
  };


  // Prepare data for the pie chart
  const employmentStatus = getEmploymentStatus();
  const pieData = {
    labels: ['Employed', 'Unemployed', 'Self-Employed', 'Retired', 'Student'],
    datasets: [
      {
        data: [
          employmentStatus.employed,
          employmentStatus.unemployed,
          employmentStatus.selfEmployed,
          employmentStatus.retired,
          employmentStatus.student,
        ],
        backgroundColor: ['#FF5733', '#33FF57', '#FFC300', '#C70039', '#900C3F'],
      },
    ],
  };

  // Prepare data for the bar chart - Age distribution
  const ageDistributionData = () => {
    const ageRanges = {
      "0-18": 0,
      "19-35": 0,
      "36-50": 0,
      "51-65": 0,
      "65+": 0,
    };
    residents.forEach(resident => {
      const age = resident.age;
      if (age <= 18) ageRanges["0-18"]++;
      else if (age <= 35) ageRanges["19-35"]++;
      else if (age <= 50) ageRanges["36-50"]++;
      else if (age <= 65) ageRanges["51-65"]++;
      else ageRanges["65+"]++;
    });

    return {
      labels: Object.keys(ageRanges),
      datasets: [
        {
          label: 'Age Distribution',
          data: Object.values(ageRanges),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#e11d48', '#9333ea'],
        },
      ],
    };
  };

  // Prepare data for the bar chart - Monthly Income distribution
  const incomeDistributionData = () => {
    const incomeRanges = {
      "<10k": 0,
      "10k-20k": 0,
      "20k-30k": 0,
      "30k+": 0,
    };
    residents.forEach(resident => {
      const income = resident.monthlyIncome;
      if (income < 10000) incomeRanges["<10k"]++;
      else if (income <= 20000) incomeRanges["10k-20k"]++;
      else if (income <= 30000) incomeRanges["20k-30k"]++;
      else incomeRanges["30k+"]++;
    });

    return {
      labels: Object.keys(incomeRanges),
      datasets: [
        {
          label: 'Monthly Income Distribution',
          data: Object.values(incomeRanges),
          backgroundColor: ['#0d9488', '#f97316', '#ef4444', '#4f46e5'],
        },
      ],
    };
  };

  const { totalResidents, totalVoters, totalSeniorCitizens } = getResidentStats();

  useEffect(() => {
    // Clean up chart instances on unmount
    return () => {
      Object.keys(chartRefs.current).forEach(key => {
        const chart = chartRefs.current[key];
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, []);

  return (
    <div className="dashboard-container">
     <h2 className="heading">Dashboard</h2>


      <div className="dashboard-cards">
        <div className="dash-card">
          <Users size={24} className="icon" />
          <h3>Residents</h3>
          <p>{totalResidents}</p>
        </div>
        <div className="dash-card">
          <CheckCircle size={24} className="icon" />
          <h3>Voters</h3>
          <p>{totalVoters}</p>
        </div>
        <div className="dash-card">
          <UserCheck size={24} className="icon" />
          <h3>Senior Citizens</h3>
          <p>{totalSeniorCitizens}</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <h4>Employment Status</h4>
          <Pie data={pieData} />
        </div>
        <div className="stat-item">
          <h4>Age Distribution</h4>
          <Bar
            data={ageDistributionData()}
            ref={el => chartRefs.current["ageDistribution"] = el}
          />
        </div>
        <div className="stat-item">
          <h4>Monthly Income Distribution</h4>
          <Bar
            data={incomeDistributionData()}
            ref={el => chartRefs.current["incomeDistribution"] = el}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
