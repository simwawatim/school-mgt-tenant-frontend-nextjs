// mockAcademicYear.ts
export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const startYear = 2020;
const endYear = 2030;
export const mockAcademicYears: AcademicYear[] = Array.from({ length: 11 }, (_, i) => {
  const year = startYear + i;
  return {
    id: i + 1,
    name: `${year}-${year + 1}`,
    startDate: `${year}-08-01`,
    endDate: `${year + 1}-07-31`,
    isActive: i === 5, // only the 2025-2026 year is active
  };
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchAcademicYears = async (): Promise<AcademicYear[]> => {
  await delay(800);
  return [...mockAcademicYears];
};

export const createAcademicYear = async (data: Omit<AcademicYear, 'id'>): Promise<AcademicYear> => {
  await delay(600);
  const newItem = { ...data, id: Math.max(...mockAcademicYears.map(y => y.id)) + 1 };
  mockAcademicYears.push(newItem);
  return newItem;
};

export const updateAcademicYear = async (id: number, data: Partial<AcademicYear>): Promise<AcademicYear> => {
  await delay(600);
  const index = mockAcademicYears.findIndex(y => y.id === id);
  if (index === -1) throw new Error('Academic Year not found');
  mockAcademicYears[index] = { ...mockAcademicYears[index], ...data };
  return mockAcademicYears[index];
};

export const deleteAcademicYear = async (id: number): Promise<void> => {
  await delay(500);
  const index = mockAcademicYears.findIndex(y => y.id === id);
  if (index !== -1) mockAcademicYears.splice(index, 1);
};