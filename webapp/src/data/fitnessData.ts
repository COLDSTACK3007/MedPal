export interface ExerciseItem {
  id: string;
  name: string;
  category: 'exercise' | 'yoga' | 'cardio' | 'nutrition';
  type: string;
  durationOrReps: string;
  defaultSets: number;
  caloriesBurned: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetMuscles: string[];
  steps: string[];
  benefits: string;
  safetyTip: string;
}

export interface FitnessGoalOption {
  id: string;
  label: string;
  description: string;
}

export const FITNESS_GOALS: FitnessGoalOption[] = [
  { id: 'weight_loss', label: 'Weight Loss & Calorie Burn', description: 'Fat loss with active cardio and bodyweight routines' },
  { id: 'maintenance', label: 'General Health & Maintenance', description: 'Balanced physical movement, stamina, and wellbeing' },
  { id: 'muscle_tone', label: 'Tone & Strength Building', description: 'Core and muscle strengthening exercises' },
  { id: 'flexibility_yoga', label: 'Flexibility & Stress Relief', description: 'Yoga asanas, mobility, and deep breathing' },
];

export const EXERCISE_DATABASE: ExerciseItem[] = [
  // Yoga Asanas
  {
    id: 'yoga_surya_namaskar',
    name: 'Surya Namaskar (Sun Salutation)',
    category: 'yoga',
    type: 'Full Body Flow',
    durationOrReps: '5 - 12 Rounds',
    defaultSets: 3,
    caloriesBurned: 70,
    difficulty: 'Beginner',
    targetMuscles: ['Full Body', 'Spine', 'Hamstrings', 'Chest'],
    steps: [
      'Stand upright in Pranamasana (Prayer pose) taking deep breaths.',
      'Inhale and raise arms overhead into Hastauttanasana (Raised Arms Pose).',
      'Exhale and bend forward to touch feet in Padahastasana.',
      'Step right leg back into Ashwa Sanchalanasana (Equestrian Pose).',
      'Step left leg back to Plank, lowers knees, chest, and chin (Ashtanga Namaskara).',
      'Inhale into Cobra Pose (Bhujangasana), then transition to Downward Dog (Adho Mukha Svanasana).'
    ],
    benefits: 'Improves blood circulation, enhances flexibility, and boosts metabolism.',
    safetyTip: 'Move gracefully with breath control; avoid hyper-extending low back.'
  },
  {
    id: 'yoga_vrikshasana',
    name: 'Vrikshasana (Tree Pose)',
    category: 'yoga',
    type: 'Balance & Stability',
    durationOrReps: '45 - 60 sec per leg',
    defaultSets: 2,
    caloriesBurned: 25,
    difficulty: 'Beginner',
    targetMuscles: ['Ankles', 'Calves', 'Thighs', 'Core'],
    steps: [
      'Stand straight with feet together and arms at your sides.',
      'Shift weight onto left leg and place right foot sole high on inner left thigh.',
      'Bring palms together in front of chest in prayer position or overhead.',
      'Focus eyes on a fixed point in front of you for stability.',
      'Hold for 30-60 seconds breathing deeply, then switch legs.'
    ],
    benefits: 'Strengthens legs, improves balance, focus, and hip mobility.',
    safetyTip: 'Avoid placing foot directly on knee joint; place above or below it.'
  },
  {
    id: 'yoga_bhujangasana',
    name: 'Bhujangasana (Cobra Pose)',
    category: 'yoga',
    type: 'Back & Core Stretch',
    durationOrReps: '30 - 45 seconds',
    defaultSets: 3,
    caloriesBurned: 20,
    difficulty: 'Beginner',
    targetMuscles: ['Lower Back', 'Abs', 'Shoulders'],
    steps: [
      'Lie flat on stomach with forehead touching ground and palms near shoulders.',
      'Inhale slowly and lift head, chest, and torso off the floor using back muscles.',
      'Keep shoulders relaxed away from ears and elbows slightly bent.',
      'Hold position for 20-30 seconds while breathing rhythmically.',
      'Exhale as you lower gently back down to starting position.'
    ],
    benefits: 'Relieves lower back stiffness, opens chest, and tones abdominal muscles.',
    safetyTip: 'Keep hips grounded on the mat; do not over-strain spine.'
  },
  {
    id: 'yoga_anulom_vilom',
    name: 'Anulom Vilom (Alternate Nostril Breathing)',
    category: 'yoga',
    type: 'Pranayama & Meditation',
    durationOrReps: '5 - 10 Minutes',
    defaultSets: 1,
    caloriesBurned: 15,
    difficulty: 'Beginner',
    targetMuscles: ['Lungs', 'Nervous System', 'Mind'],
    steps: [
      'Sit comfortably in cross-legged Sukhasana with spine straight.',
      'Close right nostril with thumb and inhale deeply through left nostril.',
      'Close left nostril with ring finger, release right nostril, and exhale fully.',
      'Inhale through right nostril, then close right nostril and exhale through left nostril.',
      'Continue alternate breathing continuously for 5-10 minutes.'
    ],
    benefits: 'Calms mind, reduces stress, improves lung capacity, and regulates blood pressure.',
    safetyTip: 'Keep breath smooth and effortless without forcing air.'
  },

  // Cardio Exercises
  {
    id: 'cardio_brisk_walk',
    name: 'Brisk Walking / Jogging',
    category: 'cardio',
    type: 'Aerobic Endurance',
    durationOrReps: '20 - 45 Minutes',
    defaultSets: 1,
    caloriesBurned: 180,
    difficulty: 'Beginner',
    targetMuscles: ['Quadriceps', 'Calves', 'Glutes', 'Heart'],
    steps: [
      'Warm up with 3 minutes of easy walking.',
      'Increase stride pace so heart rate rises and breathing becomes moderate.',
      'Maintain upright posture with chin parallel to ground and arms swinging naturally.',
      'Cool down with 3 minutes of relaxed walking and leg stretches.'
    ],
    benefits: 'Boosts cardiovascular health, burns fat, and improves joint health.',
    safetyTip: 'Wear supportive shoes and stay hydrated.'
  },
  {
    id: 'cardio_jumping_jacks',
    name: 'Jumping Jacks',
    category: 'cardio',
    type: 'High Calorie Burn',
    durationOrReps: '30 - 45 seconds',
    defaultSets: 3,
    caloriesBurned: 60,
    difficulty: 'Beginner',
    targetMuscles: ['Calves', 'Shoulders', 'Full Body Cardio'],
    steps: [
      'Stand upright with feet together and arms at sides.',
      'Jump feet outward wider than shoulders while bringing arms overhead in single fluid motion.',
      'Immediately jump back to starting standing position.',
      'Repeat in rhythm continuously for target duration.'
    ],
    benefits: 'Increases heart rate quickly, improves coordination, and burns calories.',
    safetyTip: 'Land softly on balls of feet to cushion impact on knees.'
  },

  // Bodyweight & Strength Exercises
  {
    id: 'strength_squats',
    name: 'Bodyweight Squats',
    category: 'exercise',
    type: 'Lower Body Strength',
    durationOrReps: '12 - 15 Reps',
    defaultSets: 3,
    caloriesBurned: 45,
    difficulty: 'Beginner',
    targetMuscles: ['Quads', 'Hamstrings', 'Glutes', 'Core'],
    steps: [
      'Stand with feet shoulder-width apart and toes pointed slightly out.',
      'Extend arms forward for balance or keep hands at chest.',
      'Bend knees and push hips back as if sitting down into a chair.',
      'Lower until thighs are parallel to ground while keeping chest lifted.',
      'Drive through heels to press back up to standing.'
    ],
    benefits: 'Builds lower body strength, improves knee stability, and enhances mobility.',
    safetyTip: 'Ensure knees do not cave inward or extend far past toes.'
  },
  {
    id: 'strength_pushups',
    name: 'Incline / Standard Push-Ups',
    category: 'exercise',
    type: 'Upper Body Strength',
    durationOrReps: '8 - 12 Reps',
    defaultSets: 3,
    caloriesBurned: 40,
    difficulty: 'Intermediate',
    targetMuscles: ['Chest', 'Triceps', 'Shoulders', 'Abs'],
    steps: [
      'Place hands on floor or wall/table shoulder-width apart.',
      'Extend legs back in straight plank line from head to heels.',
      'Lower chest towards floor by bending elbows to 45 degree angle.',
      'Push firmly away to return to starting plank position.'
    ],
    benefits: 'Develops chest and arm strength while strengthening core endurance.',
    safetyTip: 'Keep core engaged to prevent sagging lower back.'
  },
  {
    id: 'strength_plank',
    name: 'Core Forearm Plank',
    category: 'exercise',
    type: 'Core Stability',
    durationOrReps: '30 - 60 seconds',
    defaultSets: 3,
    caloriesBurned: 30,
    difficulty: 'Intermediate',
    targetMuscles: ['Rectus Abdominis', 'Obliques', 'Shoulders', 'Glutes'],
    steps: [
      'Place forearms on floor with elbows directly under shoulders.',
      'Extend legs back with toes grounded on floor.',
      'Engage abdominals, glutes, and legs into straight rigid plank.',
      'Hold position while breathing steadily without letting hips dip or arch up.'
    ],
    benefits: 'Strengthens abdominal wall, improves spinal alignment, and protects lower back.',
    safetyTip: 'Avoid holding breath; keep neck neutral gazing towards hands.'
  }
];

export function calculateBMI(heightCm: number, weightKg: number) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return { bmi: 0, category: 'Invalid Input', statusColor: '#6B7280', description: 'Enter valid height and weight.' };
  }

  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return {
      bmi,
      category: 'Underweight',
      statusColor: '#3B82F6', // Blue
      description: 'Your weight is below the standard recommended range. Focus on nutrient-rich diet and resistance exercises.',
      badgeClass: 'badge-underweight',
      recommendationsTag: 'Weight & Strength Focus'
    };
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    return {
      bmi,
      category: 'Healthy Weight',
      statusColor: '#10B981', // Green
      description: 'Awesome! Your BMI is within the healthy optimal range. Keep up your active lifestyle and balanced wellness.',
      badgeClass: 'badge-healthy',
      recommendationsTag: 'Maintenance & Vitality'
    };
  } else if (bmi >= 25.0 && bmi <= 29.9) {
    return {
      bmi,
      category: 'Overweight',
      statusColor: '#F59E0B', // Amber
      description: 'Your BMI is slightly above optimal range. Daily brisk walking, low-impact exercise, and portion control can help.',
      badgeClass: 'badge-overweight',
      recommendationsTag: 'Active Fat Burn & Cardio'
    };
  } else {
    return {
      bmi,
      category: 'Obese Range',
      statusColor: '#EF4444', // Red
      description: 'Your BMI indicates obesity range. Gradual cardio movement, joint-friendly yoga, and consistent hydration are advised.',
      badgeClass: 'badge-obese',
      recommendationsTag: 'Low Impact & Gentle Movement'
    };
  }
}

export function calculateBMRAndTDEE(heightCm: number, weightKg: number, age: number, gender: 'male' | 'female', activityLevel: string) {
  if (!heightCm || !weightKg || !age) return { bmr: 0, tdee: 0, waterLiters: 2.5 };

  // Mifflin-St Jeor Formula
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  bmr = gender === 'male' ? bmr + 5 : bmr - 161;

  let multiplier = 1.2; // Sedentary
  if (activityLevel === 'light') multiplier = 1.375;
  if (activityLevel === 'moderate') multiplier = 1.55;
  if (activityLevel === 'very_active') multiplier = 1.725;

  const tdee = Math.round(bmr * multiplier);
  const waterLiters = parseFloat((weightKg * 0.035).toFixed(1));

  return { bmr: Math.round(bmr), tdee, waterLiters };
}

export function getRecommendedRoutine(bmiCategory: string, goal: string): ExerciseItem[] {
  let recommended = [...EXERCISE_DATABASE];

  if (goal === 'flexibility_yoga') {
    return recommended.filter(item => item.category === 'yoga' || item.id === 'cardio_brisk_walk');
  }

  if (bmiCategory === 'Obese Range') {
    // Joint friendly & gentle
    return recommended.filter(item =>
      ['yoga_anulom_vilom', 'yoga_vrikshasana', 'cardio_brisk_walk', 'yoga_bhujangasana'].includes(item.id)
    );
  }

  if (bmiCategory === 'Overweight' || goal === 'weight_loss') {
    return recommended.filter(item =>
      ['cardio_jumping_jacks', 'cardio_brisk_walk', 'strength_squats', 'yoga_surya_namaskar', 'strength_plank'].includes(item.id)
    );
  }

  if (goal === 'muscle_tone') {
    return recommended.filter(item =>
      ['strength_pushups', 'strength_squats', 'strength_plank', 'yoga_surya_namaskar'].includes(item.id)
    );
  }

  // General default mix
  return [
    EXERCISE_DATABASE[0], // Surya Namaskar
    EXERCISE_DATABASE[4], // Brisk Walk
    EXERCISE_DATABASE[6], // Squats
    EXERCISE_DATABASE[3], // Anulom Vilom
  ];
}
