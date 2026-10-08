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

export interface PhonebookEntry {
  id: string;
  name: string;
  title: string;
  role: string;
  department: string;
  phone: string;
  extension: string;
  email: string;
}

export type StaffUnitCategory = 'all' | 'fakulte' | 'enstitu' | 'yuksekokul' | 'myo' | 'konservatuvar' | 'daire' | 'koordinatorluk';

export interface AcademicStaffMember {
  id: string;
  fullName: string;
  title: string;
  name: string;
  role: string;
  facultyId: string;
  facultyName: string;
  facultyShortName: string;
  department: string;
  academicDiscipline?: string;
  administrativeDuty?: string;
  unitCategory?: StaffUnitCategory;
  email: string;
  image?: string;
  phone?: string;
  officeLocation?: string;
  sourceUrl: string;
  yokUrl?: string;
  scholarUrl?: string;
  orcidUrl?: string;
  publonsUrl?: string;
}

export interface DepartmentNewsItem {
  id: string;
  title: string;
  date: string;
  content?: string;
  url: string;
  imageUrl?: string;
  facultyId: string;
  facultyName: string;
  departmentId: string;
  departmentName: string;
  category?: string;
  sourceUrl?: string;
}

export interface DepartmentAnnouncementItem {
  id: string;
  title: string;
  date: string;
  content?: string;
  url: string;
  imageUrl?: string;
  facultyId: string;
  facultyName: string;
  departmentId: string;
  departmentName: string;
  category?: string;
  sourceUrl?: string;
}

export interface AcademicDepartmentUnit {
  id: string;
  name: string;
  slug: string;
  facultyId: string;
  facultyName: string;
  category: StaffUnitCategory;
  newsUrl: string;
  announcementUrl?: string;
  websiteUrl?: string;
  description?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  date: string;
  location?: string;
  url?: string;
  img?: string;
  category?: string;
}

export interface CampusForm {
  id: string;
  title: string;
  source: 'kilis.edu.tr' | 'ogrenciisleri.kilis.edu.tr' | 'faculty';
  sourceName: string;
  sourceUrl: string;
  faculty?: string;
  department?: string;
  category: string;
  fileType: string;
  downloadUrl: string;
  description: string;
}

export interface TransportRoute {
  id: string;
  name: string;
  badge: string;
  hours: string;
  frequency: string;
  route: string[];
  notes?: string;
}

export interface CampusBuilding {
  id: string;
  name: string;
  campus: 'Merkez Kampüs' | 'Karataş Kampüsü' | 'Mercidabık Kampüsü';
  type: 'Fakülte' | 'Yüksekokul' | 'Sosyal / İdari' | 'Spor & Sağlık';
  description: string;
  mapsUrl: string;
  coordinates: { lat: number; lng: number };
}
