// ========================================
// Diet System - Charts JavaScript
// ========================================

// Progress Ring Chart (User Dashboard)
function initProgressRing(percentage, elementId = 'progressRing') {
  const ring = document.getElementById(elementId);
  if (!ring) return;
  
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = offset;
  
  // Set color based on percentage
  if (percentage > 100) {
    ring.style.stroke = '#e74c3c';
  } else if (percentage > 80) {
    ring.style.stroke = '#f39c12';
  } else {
    ring.style.stroke = '#2ecc71';
  }
}

// Weekly Calorie Bar Chart
function initWeeklyCalorieChart(ctx, data, calorieLimit) {
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Calories',
        data: data,
        backgroundColor: data.map(cal => cal > calorieLimit ? '#e74c3c' : '#2ecc71'),
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' kcal';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return value + ' kcal';
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Line Chart (Progress Tracking)
function initLineChart(ctx, labels, data, label = 'Progress', color = '#2ecc71') {
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Doughnut/Pie Chart
function initDoughnutChart(ctx, labels, data, colors) {
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors || ['#2ecc71', '#3498db', '#f39c12', '#e74c3c', '#9b59b6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              family: "'DM Sans', sans-serif"
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}

// Bar Chart
function initBarChart(ctx, labels, data, label = 'Data', color = '#2ecc71') {
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        backgroundColor: color,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Radar Chart (Health Metrics)
function initRadarChart(ctx, labels, data, color = '#2ecc71') {
  if (!ctx) return null;
  
  return new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Health Score',
        data: data,
        backgroundColor: color + '30',
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          pointLabels: {
            font: {
              family: "'DM Sans', sans-serif"
            }
          }
        }
      }
    }
  });
}

// Update chart data dynamically
function updateChartData(chart, newData) {
  if (chart && chart.data) {
    chart.data.datasets[0].data = newData;
    chart.update();
  }
}

// Destroy chart
function destroyChart(chart) {
  if (chart) {
    chart.destroy();
  }
}

// Chart color palette
const chartColors = {
  primary: '#2ecc71',
  secondary: '#3498db',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#9b59b6',
  success: '#27ae60',
  light: '#ecf0f1',
  dark: '#2c3e50'
};

// Get color based on value
function getChartColor(value, threshold = 100) {
  if (value > threshold) return chartColors.danger;
  if (value > threshold * 0.8) return chartColors.warning;
  return chartColors.primary;
}

// Generate gradient for chart
function createGradient(ctx, color1, color2) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

// Export chart as image
function exportChartAsImage(chart, filename = 'chart.png') {
  if (!chart) return;
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = chart.toBase64Image();
  link.click();
}

// Responsive chart resize
function resizeChart(chart) {
  if (chart) {
    chart.resize();
  }
}

// Initialize all charts on page
function initAllCharts() {
  // User dashboard charts
  const weeklyChart = document.getElementById('weeklyChart');
  if (weeklyChart) {
    const calorieData = [1800, 2100, 1950, 2200, 1850, 2300, 0];
    initWeeklyCalorieChart(weeklyChart, calorieData, 2000);
  }
  
  // Dietitian dashboard charts
  const progressChart = document.getElementById('dietitianProgressChart');
  if (progressChart) {
    initLineChart(progressChart, ['Week 1', 'Week 2', 'Week 3', 'Week 4'], [20, 35, 50, 65], 'Progress');
  }
  
  const goalChart = document.getElementById('userGoalChart');
  if (goalChart) {
    initDoughnutChart(goalChart, ['Weight Loss', 'Muscle Gain', 'Maintenance'], [40, 35, 25]);
  }
  
  // Admin dashboard charts
  const roleChart = document.getElementById('roleDistributionChart');
  if (roleChart) {
    initDoughnutChart(roleChart, ['Users', 'Dietitians', 'Admins'], [25, 8, 2]);
  }
  
  const monthlyChart = document.getElementById('monthlyPlansChart');
  if (monthlyChart) {
    initBarChart(monthlyChart, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [12, 19, 15, 25, 22, 30], 'Plans');
  }
  
  const activityChart = document.getElementById('activityChart');
  if (activityChart) {
    initLineChart(activityChart, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [45, 52, 48, 60, 55, 30, 25], 'Active Users');
  }
}

// Auto-initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initAllCharts();
});

// Handle window resize for charts
window.addEventListener('resize', function() {
  // Charts.js handles resizing automatically with responsive: true
});