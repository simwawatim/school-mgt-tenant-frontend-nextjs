// Mock data for teachers
export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;        // e.g., Teacher, Senior Teacher, Head of Department
  department: string;       // e.g., Mathematics, Science, English
  subjects: string[];       // subjects taught
  hireDate: string;         // ISO date string
  address: string;
  isActive: boolean;
}

export const departments = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Physical Education",
  "Art",
  "Music",
  "Computer Science",
  "Foreign Languages"
];

export const positions = [
  "Teacher",
  "Senior Teacher",
  "Head of Department",
  "Assistant Teacher",
  "Substitute Teacher",
  "Intern"
];

export const subjectOptions = [
  "Algebra",
  "Geometry",
  "Calculus",
  "Biology",
  "Chemistry",
  "Physics",
  "Literature",
  "Grammar",
  "World History",
  "Geography",
  "Physical Education",
  "Art History",
  "Music Theory",
  "Programming",
  "French",
  "Spanish"
];

// Generate a random date within the last 5 years
const randomHireDate = (): string => {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 5);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

// Generate random phone number
const randomPhone = (): string => {
  return `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
};

// Create mock teachers
export const mockTeachers: Teacher[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  firstName: `Teacher${i + 1}`,
  lastName: `Last${i + 1}`,
  email: `teacher${i + 1}@school.edu`,
  phone: randomPhone(),
  position: positions[Math.floor(Math.random() * positions.length)],
  department: departments[Math.floor(Math.random() * departments.length)],
  subjects: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => subjectOptions[Math.floor(Math.random() * subjectOptions.length)]),
  hireDate: randomHireDate(),
  address: `${Math.floor(Math.random() * 999) + 100} Main St, City, State`,
  isActive: Math.random() > 0.2, // 80% active
}));

// Simulate async API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchTeachers = async (): Promise<Teacher[]> => {
  await delay(800); // simulate network
  return [...mockTeachers];
};

export const createTeacher = async (teacherData: Omit<Teacher, 'id'>): Promise<Teacher> => {
  await delay(600);
  const newTeacher = {
    ...teacherData,
    id: Math.max(...mockTeachers.map(t => t.id)) + 1,
  };
  mockTeachers.push(newTeacher);
  return newTeacher;
};

export const updateTeacher = async (id: number, teacherData: Partial<Teacher>): Promise<Teacher> => {
  await delay(600);
  const index = mockTeachers.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Teacher not found');
  mockTeachers[index] = { ...mockTeachers[index], ...teacherData };
  return mockTeachers[index];
};

export const deleteTeacher = async (id: number): Promise<void> => {
  await delay(500);
  const index = mockTeachers.findIndex(t => t.id === id);
  if (index !== -1) mockTeachers.splice(index, 1);
};