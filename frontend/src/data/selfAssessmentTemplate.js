/**
 * @file selfAssessmentTemplate.js
 * @description Form field definitions and default values for the intern self-assessment.
 */

export const selfAssessmentFields = [
  {
    id: 'productivityRating',
    label: 'Productivity',
    description: 'How effectively did you complete your assigned tasks this period?',
    type: 'rating',
    min: 1,
    max: 10,
    required: true,
  },
  {
    id: 'communicationRating',
    label: 'Communication',
    description: 'How well did you communicate with your team, supervisors, and stakeholders?',
    type: 'rating',
    min: 1,
    max: 10,
    required: true,
  },
  {
    id: 'teamworkRating',
    label: 'Teamwork',
    description: 'How effectively did you collaborate with and support your team members?',
    type: 'rating',
    min: 1,
    max: 10,
    required: true,
  },
  {
    id: 'initiativeRating',
    label: 'Initiative',
    description: 'How proactively did you go beyond your assigned responsibilities?',
    type: 'rating',
    min: 1,
    max: 10,
    required: true,
  },
  {
    id: 'overallReflection',
    label: 'Overall Reflection',
    description: 'Share your overall thoughts on your performance this period.',
    type: 'textarea',
    placeholder: 'Reflect on your overall experience, growth, and areas of focus...',
    minLength: 50,
    required: true,
  },
  {
    id: 'achievements',
    label: 'Key Achievements',
    description: 'List your most significant accomplishments this period.',
    type: 'textarea',
    placeholder: '- Achievement 1\n- Achievement 2\n- Achievement 3',
    required: true,
  },
  {
    id: 'challenges',
    label: 'Challenges Faced',
    description: 'What were the main challenges you encountered and how did you address them?',
    type: 'textarea',
    placeholder: 'Describe the challenges and how you responded to them...',
    required: true,
  },
  {
    id: 'nextGoals',
    label: 'Goals for Next Period',
    description: 'What specific goals do you want to focus on in the next review period?',
    type: 'textarea',
    placeholder: '- Goal 1: ...\n- Goal 2: ...\n- Goal 3: ...',
    required: true,
  },
];

export const selfAssessmentDefaults = {
  productivityRating: 5,
  communicationRating: 5,
  teamworkRating: 5,
  initiativeRating: 5,
  overallReflection: '',
  achievements: '',
  challenges: '',
  nextGoals: '',
};
