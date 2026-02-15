// Mock data for students

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;      // YYYY-MM-DD
  address: string;
  grade: string;            // e.g., "Grade 5"
  className: string;        // e.g., "Class A"
  enrollmentDate: string;   // YYYY-MM-DD
  parentName: string;
  parentPhone: string;
  isActive: boolean;
}

export const grades = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12"
];

export const classNames = [
  "Class A", "Class B", "Class C", "Class D", "Class E"
];

// Helper to generate random date within range
const randomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().split('T')[0];
};

// Generate random phone number
const randomPhone = (): string => {
  return `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
};

// Create 50 mock students
export const mockStudents: Student[] = Array.from({ length: 50 }, (_, i) => {
  const now = new Date();
  const birthStart = new Date(now.getFullYear() - 18, 0, 1); // 18 years ago
  const birthEnd = new Date(now.getFullYear() - 6, 11, 31);  // 6 years ago
  const enrollStart = new Date(now.getFullYear() - 5, 0, 1);
  const enrollEnd = now;

  return {
    id: i + 1,
    firstName: `Student${i + 1}`,
    lastName: `Last${i + 1}`,
    email: `student${i + 1}@school.edu`,
    phone: randomPhone(),
    dateOfBirth: randomDate(birthStart, birthEnd),
    address: `${Math.floor(Math.random() * 999) + 100} Elm St, City, State`,
    grade: grades[Math.floor(Math.random() * grades.length)],
    className: classNames[Math.floor(Math.random() * classNames.length)],
    enrollmentDate: randomDate(enrollStart, enrollEnd),
    parentName: `Parent ${i + 1}`,
    parentPhone: randomPhone(),
    isActive: Math.random() > 0.15, // 85% active
  };
});

// Simulate async API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchStudents = async (): Promise<Student[]> => {
  await delay(800);
  return [...mockStudents];
};

export const createStudent = async (studentData: Omit<Student, 'id'>): Promise<Student> => {
  await delay(600);
  const newStudent = {
    ...studentData,
    id: Math.max(...mockStudents.map(s => s.id)) + 1,
  };
  mockStudents.push(newStudent);
  return newStudent;
};

export const updateStudent = async (id: number, studentData: Partial<Student>): Promise<Student> => {
  await delay(600);
  const index = mockStudents.findIndex(s => s.id === id);
  if (index === -1) throw new Error('Student not found');
  mockStudents[index] = { ...mockStudents[index], ...studentData };
  return mockStudents[index];
};

export const deleteStudent = async (id: number): Promise<void> => {
  await delay(500);
  const index = mockStudents.findIndex(s => s.id === id);
  if (index !== -1) mockStudents.splice(index, 1);
};