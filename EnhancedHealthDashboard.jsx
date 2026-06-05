import React, { useState, useEffect } from 'react';

/**
 * Enhanced Personal Health Dashboard
 * Features:
 * - Calorie Limit Warning System with visual progress tracking
 * - Water Intake Tracker with multiple unit support
 * - Persistent storage across sessions
 * - Real-time updates and responsive design
 */

const EnhancedHealthDashboard = () => {
  // Calorie State
  const [calorieGoal, setCalorieGoalState] = useState(2000);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [showCalorieWarning, setShowCalorieWarning] = useState(false);

  // Water Intake State
  const [waterUnit, setWaterUnit] = useState('glasses');
  const [waterGoal, setWaterGoalState] = useState(8);
  const [waterConsumed, setWaterConsumedState] = useState(0);
  const [manualWaterInput, setManualWaterInput] = useState('');

  // Initialize from persistent storage
  useEffect(() => {
    initializeFromStorage();
  }, []);

  // Update warning when calories change
  useEffect(() => {
    const percentage = (caloriesConsumed / calorieGoal) * 100;
    setShowCalorieWarning(percentage >= 100);
  }, [caloriesConsumed, calorieGoal]);

  // Storage Key Generator
  const getStorageKey = (key) => {
    const today = new Date().toLocaleDateString('en-CA');
    return `health_dashboard:${today}:${key}`;
  };

  // Initialize from localStorage
  const initializeFromStorage = () => {
    try {
      const storedGoal = localStorage.getItem('calorieGoal');
      const storedWaterGoal = localStorage.getItem('waterGoal');
      const storedWaterUnit = localStorage.getItem('waterUnit');
      const storedCalories = localStorage.getItem(getStorageKey('caloriesConsumed'));
      const storedWater = localStorage.getItem(getStorageKey('waterConsumed'));

      if (storedGoal) setCalorieGoalState(Number(storedGoal));
      if (storedWaterGoal) setWaterGoalState(Number(storedWaterGoal));
      if (storedWaterUnit) setWaterUnit(storedWaterUnit);
      if (storedCalories) setCaloriesConsumed(Number(storedCalories));
      if (storedWater) setWaterConsumedState(Number(storedWater));
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  // Save to localStorage
  const saveToStorage = (key, value, isDaily = false) => {
    try {
      if (isDaily) {
        localStorage.setItem(getStorageKey(key), JSON.stringify(value));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  // ==================== CALORIE MANAGEMENT ====================

  const handleCalorieGoalChange = (e) => {
    const value = Number(e.target.value);
    if (value > 0) {
      setCalorieGoalState(value);
      saveToStorage('calorieGoal', value);
    }
  };

  const addCalories = (amount) => {
    const newTotal = Math.max(0, caloriesConsumed + amount);
    setCaloriesConsumed(newTotal);
    saveToStorage('caloriesConsumed', newTotal, true);
  };

  const resetCalories = () => {
    setCaloriesConsumed(0);
    saveToStorage('caloriesConsumed', 0, true);
  };

  const caloriePercentage = Math.round((caloriesConsumed / calorieGoal) * 100);
  const caloriesRemaining = Math.max(0, calorieGoal - caloriesConsumed);
  const calorieExceeded = caloriesConsumed > calorieGoal;

  // ==================== WATER MANAGEMENT ====================

  const ML_PER_GLASS = 250;

  const handleWaterUnitChange = (unit) => {
    setWaterUnit(unit);
    saveToStorage('waterUnit', unit);
  };

  const handleWaterGoalChange = (e) => {
    const value = Number(e.target.value);
    if (value > 0) {
      setWaterGoalState(value);
      saveToStorage('waterGoal', value);
    }
  };

  const addWater = (amount, isGlasses = false) => {
    const mlAmount = isGlasses ? amount * ML_PER_GLASS : amount;
    const newTotal = waterConsumed + mlAmount;
    setWaterConsumedState(newTotal);
    saveToStorage('waterConsumed', newTotal, true);
  };

  const addManualWater = () => {
    const input = Number(manualWaterInput);
    if (input > 0) {
      const isGlasses = waterUnit === 'glasses';
      addWater(input, isGlasses);
      setManualWaterInput('');
    }
  };

  const resetWater = () => {
    setWaterConsumedState(0);
    setManualWaterInput('');
    saveToStorage('waterConsumed', 0, true);
  };

  const getWaterDisplay = () => {
    if (waterUnit === 'ml') {
      return {
        consumed: `${Math.round(waterConsumed)} ml`,
        goal: `${Math.round(waterGoal)} ml`,
        unit: 'ml'
      };
    } else {
      const glasses = (waterConsumed / ML_PER_GLASS).toFixed(1);
      return {
        consumed: `${parseFloat(glasses)} glasses`,
        goal: `${waterGoal} glasses`,
        unit: 'glasses'
      };
    }
  };

  const getWaterGoalMl = () => {
    return waterUnit === 'ml' ? waterGoal : waterGoal * ML_PER_GLASS;
  };

  const waterPercentage = Math.round((waterConsumed / getWaterGoalMl()) * 100);
  const waterDisplay = getWaterDisplay();

  const getHydrationMessage = () => {
    if (waterPercentage >= 100) return 'Goal reached! 🎉';
    if (waterPercentage >= 50) return 'Halfway there! 💪';
    if (waterPercentage >= 25) return 'Nice progress, keep sipping! 💧';
    return 'Stay hydrated! 💧';
  };

  const getCalorieStatus = () => {
    if (caloriePercentage >= 100) return 'danger';
    if (caloriePercentage >= 80) return 'warning';
    return 'success';
  };

  const getWaterStatus = () => {
    if (waterPercentage >= 100) return 'success';
    if (waterPercentage >= 50) return 'warning';
    return 'info';
  };

  // ==================== RENDER ====================

  return (
    <div className="enhanced-dashboard" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ==================== CALORIE LIMIT WARNING SYSTEM ==================== */}
      <section className="dashboard-feature" style={styles.section}>
        <div style={styles.featureHeader}>
          <h2 style={styles.featureTitle}>
            <span style={styles.icon}>🔥</span> Daily Calorie Goal
          </h2>
          <span style={{
            ...styles.badge,
            backgroundColor: getCalorieStatus() === 'danger' 
              ? '#c0392b' 
              : getCalorieStatus() === 'warning' 
              ? '#f39c12' 
              : '#2ecc71',
            color: '#fff'
          }}>
            {caloriePercentage >= 100 
              ? 'Limit Reached ⚠️' 
              : caloriePercentage >= 80 
              ? 'Almost There ⚠️' 
              : 'On Track ✓'}
          </span>
        </div>

        <div style={styles.card}>
          {/* Calorie Goal Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Your Daily Goal (kcal)</label>
            <input
              type="number"
              value={calorieGoal}
              onChange={handleCalorieGoalChange}
              min="1"
              step="50"
              style={styles.input}
            />
          </div>

          {/* Calorie Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{caloriesConsumed}</div>
              <div style={styles.statLabel}>Consumed</div>
            </div>
            <div style={styles.statBox}>
              <div style={{
                ...styles.statValue,
                color: calorieExceeded ? '#c0392b' : '#2ecc71'
              }}>
                {caloriesRemaining}
              </div>
              <div style={styles.statLabel}>
                {calorieExceeded ? 'Over Goal' : 'Remaining'}
              </div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{caloriePercentage}%</div>
              <div style={styles.statLabel}>Progress</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressContainer}>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(caloriePercentage, 100)}%`,
                  backgroundColor: getCalorieStatus() === 'danger' 
                    ? '#c0392b' 
                    : getCalorieStatus() === 'warning' 
                    ? '#f39c12' 
                    : '#40916c'
                }}
              />
            </div>
            <div style={styles.progressLabel}>
              {caloriesConsumed} of {calorieGoal} kcal
            </div>
          </div>

          {/* Warning Banner */}
          {showCalorieWarning && (
            <div style={{
              ...styles.warningBanner,
              animation: 'slideIn 0.3s ease-out'
            }}>
              <span style={styles.warningIcon}>⚠️</span>
              <span>
                {calorieExceeded
                  ? `You've exceeded your daily calorie limit by ${caloriesConsumed - calorieGoal} kcal!`
                  : 'You've reached your daily calorie limit!'}
              </span>
            </div>
          )}

          {/* Quick Actions */}
          <div style={styles.actionsGrid}>
            <button
              onClick={() => addCalories(100)}
              style={{ ...styles.btn, ...styles.btnPrimary }}
            >
              +100 kcal
            </button>
            <button
              onClick={() => addCalories(250)}
              style={{ ...styles.btn, ...styles.btnPrimary }}
            >
              +250 kcal
            </button>
            <button
              onClick={resetCalories}
              style={{ ...styles.btn, ...styles.btnSecondary }}
            >
              ↺ Reset
            </button>
          </div>
        </div>
      </section>

      {/* ==================== WATER INTAKE TRACKER ==================== */}
      <section className="dashboard-feature" style={styles.section}>
        <div style={styles.featureHeader}>
          <h2 style={styles.featureTitle}>
            <span style={styles.icon}>💧</span> Water Intake Tracker
          </h2>
          <span style={{
            ...styles.badge,
            backgroundColor: getWaterStatus() === 'success' 
              ? '#2ecc71' 
              : getWaterStatus() === 'warning' 
              ? '#f39c12' 
              : '#3498db',
            color: '#fff'
          }}>
            {waterPercentage >= 100 ? 'Goal Reached! 🎉' : 'Keep Going! 💪'}
          </span>
        </div>

        <div style={styles.card}>
          {/* Unit Toggle */}
          <div style={styles.unitToggle}>
            <button
              onClick={() => handleWaterUnitChange('glasses')}
              style={{
                ...styles.toggleBtn,
                ...(waterUnit === 'glasses' ? styles.toggleBtnActive : {})
              }}
            >
              Glasses
            </button>
            <button
              onClick={() => handleWaterUnitChange('ml')}
              style={{
                ...styles.toggleBtn,
                ...(waterUnit === 'ml' ? styles.toggleBtnActive : {})
              }}
            >
              ml
            </button>
          </div>

          {/* Water Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{waterDisplay.consumed}</div>
              <div style={styles.statLabel}>Consumed</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{waterDisplay.goal}</div>
              <div style={styles.statLabel}>Goal</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{waterPercentage}%</div>
              <div style={styles.statLabel}>Progress</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressContainer}>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(waterPercentage, 100)}%`,
                  backgroundColor: '#3498db'
                }}
              />
            </div>
            <div style={styles.progressLabel}>
              {waterDisplay.consumed} of {waterDisplay.goal}
            </div>
          </div>

          {/* Motivational Message */}
          <div style={styles.motivationalMessage}>
            <span style={styles.motivationText}>
              {getHydrationMessage()}
            </span>
          </div>

          {/* Goal Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Daily Water Goal ({waterUnit})</label>
            <input
              type="number"
              value={waterGoal}
              onChange={handleWaterGoalChange}
              min="1"
              step={waterUnit === 'ml' ? '250' : '0.5'}
              style={styles.input}
            />
          </div>

          {/* Quick Add Buttons */}
          <div style={styles.quickActionsGrid}>
            <button
              onClick={() => addWater(waterUnit === 'glasses' ? 1 : 250, waterUnit === 'glasses')}
              style={{ ...styles.btn, ...styles.btnPrimary }}
            >
              <span style={styles.btnIcon}>+</span>
              {waterUnit === 'glasses' ? '1 glass' : '250 ml'}
            </button>
            <button
              onClick={() => addWater(waterUnit === 'glasses' ? 0.5 : 125, waterUnit === 'glasses')}
              style={{ ...styles.btn, ...styles.btnPrimary }}
            >
              <span style={styles.btnIcon}>+</span>
              {waterUnit === 'glasses' ? '0.5 glass' : '125 ml'}
            </button>
          </div>

          {/* Manual Input */}
          <div style={styles.manualInputContainer}>
            <label style={styles.label}>Add Water Manually</label>
            <div style={styles.inputRow}>
              <input
                type="number"
                value={manualWaterInput}
                onChange={(e) => setManualWaterInput(e.target.value)}
                placeholder={`Enter ${waterUnit}`}
                step={waterUnit === 'ml' ? '50' : '0.1'}
                min="0"
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                onClick={addManualWater}
                style={{ ...styles.btn, ...styles.btnPrimary, marginLeft: '12px', minWidth: '100px' }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetWater}
            style={{ ...styles.btn, ...styles.btnSecondary, width: '100%' }}
          >
            ↺ Reset Today's Water
          </button>
        </div>
      </section>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .enhanced-dashboard {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

// ==================== STYLES ====================
const styles = {
  section: {
    marginBottom: '24px',
    animation: 'slideIn 0.5s ease-out'
  },

  featureHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  featureTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1b4332',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  icon: {
    fontSize: '28px'
  },

  badge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(27, 67, 50, 0.08)',
    border: '1px solid rgba(27, 67, 50, 0.05)'
  },

  inputGroup: {
    marginBottom: '16px'
  },

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: '8px'
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  },

  statBox: {
    backgroundColor: '#f8f4e3',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    border: '1px solid rgba(27, 67, 50, 0.1)'
  },

  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1b4332',
    lineHeight: '1'
  },

  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px'
  },

  progressContainer: {
    marginBottom: '16px'
  },

  progressTrack: {
    backgroundColor: '#e5e7eb',
    borderRadius: '8px',
    height: '8px',
    overflow: 'hidden',
    marginBottom: '8px'
  },

  progressFill: {
    height: '100%',
    borderRadius: '8px',
    transition: 'width 0.3s ease'
  },

  progressLabel: {
    fontSize: '13px',
    color: '#6b7280',
    textAlign: 'center'
  },

  warningBanner: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#856404'
  },

  warningIcon: {
    fontSize: '18px',
    flexShrink: 0
  },

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
    marginTop: '16px'
  },

  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },

  btn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  },

  btnPrimary: {
    backgroundColor: '#40916c',
    color: '#ffffff'
  },

  btnSecondary: {
    backgroundColor: '#ede8d5',
    color: '#1b4332',
    border: '1px solid #d4a017'
  },

  btnIcon: {
    marginRight: '4px'
  },

  unitToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    backgroundColor: '#f8f4e3',
    padding: '4px',
    borderRadius: '8px'
  },

  toggleBtn: {
    flex: 1,
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  },

  toggleBtnActive: {
    backgroundColor: '#ffffff',
    color: '#1b4332',
    boxShadow: '0 2px 4px rgba(27, 67, 50, 0.1)'
  },

  motivationalMessage: {
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    textAlign: 'center',
    border: '1px solid #c8e6c9'
  },

  motivationText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#2e7d32'
  },

  manualInputContainer: {
    marginBottom: '16px'
  },

  inputRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  }
};

export default EnhancedHealthDashboard;
