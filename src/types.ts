export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  category: string; // e.g. "Ana Duyurular", "Mühendislik Fakültesi"
  url?: string;
}

export interface MenuItem {
  id: string;
  date: string;
  mainDish: string;
  sideDish: string;
  soup: string;
  dessertOrFruit: string;
  calories: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  term?: 'Güz Yarıyılı' | 'Bahar Yarıyılı' | 'Resmi Tatiller' | 'Lisansüstü' | string;
  type: 'exam' | 'holiday' | 'registration' | 'other';
  rawStart?: string;
  rawEnd?: string;
}

export interface BolognaCourse {
  id: string;
  code: string;
  name: string;
  semester: number;
  ects: number;
  credit: string;
  type: string;
  language: string;
  description: string;
  outcomes: string[];
  weeklyTopics?: { week: number; topic: string }[];
  detailTarget?: string;
  detailsLoaded?: boolean;
}

export interface BolognaDepartment {
  id: string;
  name: string;
  description: string;
  courses?: BolognaCourse[];
  sUnitId?: string;
}

export interface BolognaFaculty {
  id: string;
  name: string;
  departments: BolognaDepartment[];
}
