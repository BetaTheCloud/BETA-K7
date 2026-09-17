import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { BolognaFaculty, BolognaDepartment, BolognaCourse } from '../types';
import { BookOpen, GraduationCap, Building2, ChevronRight, ArrowLeft, Users, FileText, CheckCircle2, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { getApiUrl } from '../config';


const DEGREE_TYPES = [
  { id: 'myo', name: 'Ön Lisans', icon: 'Award' },
  { id: 'lis', name: 'Lisans', icon: 'GraduationCap' },
  { id: 'yls', name: 'Yüksek Lisans', icon: 'BookOpen' },
  { id: 'dok', name: 'Doktora', icon: 'Library' }
];

export default function Bologna() {
  const [faculties, setFaculties] = useState<BolognaFaculty[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeDegreeType, setActiveDegreeType] = useState<{id: string, name: string} | null>(null);
  const [activeFaculty, setActiveFaculty] = useState<BolognaFaculty | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<BolognaDepartment | null>(null);
  const [activeCourse, setActiveCourse] = useState<BolognaCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Faculties are now loaded when a degree type is selected
  const loadFaculties = async (typeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/bologna/faculties?type=${typeId}`));
      if (response.ok) {
        const data = await response.json();
        setFaculties(data);
      }
    } catch (err) {
      console.error("Failed to load faculties", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Set initial loading to false since we start at degree selection
  useEffect(() => { setLoading(false); }, []);
  
  // Scroll to top when view level changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeDegreeType, activeFaculty, activeDepartment, activeCourse]);


  const handleBack = () => {
    setSearchQuery('');
    if (activeCourse) {
      setActiveCourse(null);
    } else if (activeDepartment) {
      setActiveDepartment(null);
    } else if (activeFaculty) {
      setActiveFaculty(null);
    } else if (activeDegreeType) {
      setActiveDegreeType(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-neutral-500">Bologna Bilgi Sistemi yükleniyor...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header & Breadcrumbs */}
      <header className="mb-6 border-b border-[#e6e2d6] dark:border-white/10 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-display font-bold text-stone-900 dark:text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
            Bologna Sistemi
          </h2>
        </div>
        <p className="text-stone-500 dark:text-white/60 text-sm tracking-wide font-medium">Öğrenci Bilgi ve Ders Paketi Sistemi</p>
        
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-5 text-sm font-semibold tracking-wide">
          <button 
            onClick={() => { setActiveDegreeType(null); setActiveFaculty(null); setActiveDepartment(null); setActiveCourse(null); setSearchQuery(''); }}
            className={cn(
              "transition-colors",
              (!activeDegreeType) ? "text-amber-600 dark:text-amber-400" : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
            )}
          >
            Akademik Birimler
          </button>
          
          {activeDegreeType && (
            <>
              <ChevronRight strokeWidth={1.5} className="w-4 h-4 text-stone-300 dark:text-white/30" />
              <button 
                onClick={() => { setActiveFaculty(null); setActiveDepartment(null); setActiveCourse(null); setSearchQuery(''); }}
                className={cn(
                  "transition-colors",
                  (activeDegreeType && !activeFaculty) ? "text-amber-600 dark:text-amber-400" : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                )}
              >
                {activeDegreeType.name}
              </button>
            </>
          )}
          
          {activeFaculty && (
            <>
              <ChevronRight strokeWidth={1.5} className="w-4 h-4 text-stone-300 dark:text-white/30" />
              <button 
                onClick={() => { setActiveDepartment(null); setActiveCourse(null); setSearchQuery(''); }}
                className={cn(
                  "transition-colors",
                  (activeFaculty && !activeDepartment) ? "text-amber-600 dark:text-amber-400" : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                )}
              >
                {activeFaculty.name}
              </button>
            </>
          )}

          {activeDepartment && (
            <>
              <ChevronRight strokeWidth={1.5} className="w-4 h-4 text-stone-300 dark:text-white/30" />
              <button 
                onClick={() => { setActiveCourse(null); setSearchQuery(''); }}
                className={cn(
                  "transition-colors",
                  (activeDepartment && !activeCourse) ? "text-amber-600 dark:text-amber-400" : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                )}
              >
                {activeDepartment.name}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        
        {/* LEVEL 0: DEGREE TYPES */}
        {!activeDegreeType && (
          <motion.div 
            key="degrees"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {DEGREE_TYPES.map((deg) => (
              <button
                key={deg.id}
                onClick={() => {
                   setActiveDegreeType(deg);
                   loadFaculties(deg.id);
                   setSearchQuery('');
                }}
                className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-500/30 hover:shadow-md transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {deg.id === 'myo' && <Building2 strokeWidth={1.5} className="w-8 h-8 text-amber-600 dark:text-amber-400" />}
                  {deg.id === 'lis' && <GraduationCap strokeWidth={1.5} className="w-8 h-8 text-amber-600 dark:text-amber-400" />}
                  {deg.id === 'yls' && <BookOpen strokeWidth={1.5} className="w-8 h-8 text-amber-600 dark:text-amber-400" />}
                  {deg.id === 'dok' && <FileText strokeWidth={1.5} className="w-8 h-8 text-amber-600 dark:text-amber-400" />}
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {deg.name}
                </h3>
              </button>
            ))}
          </motion.div>
        )}

        {/* LEVEL 1: FACULTIES */}
        {activeDegreeType && !activeFaculty && (
          <motion.div 
            key="faculties"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <button onClick={handleBack} className="p-2 hover:bg-[#f4f1ea] dark:hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft strokeWidth={1.5} className="w-5 h-5 text-stone-500" />
                </button>
                <h3 className="text-xl font-display font-bold text-stone-800 dark:text-white/90">
                  Fakülte Seçiniz
                </h3>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Fakülte ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9] dark:bg-[#264653] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(faculties) ? faculties : [])
              .filter(fac => fac.name.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr')))
              .map((fac) => (
              <button
                key={fac.id}
                onClick={() => { setActiveFaculty(fac); setSearchQuery(''); }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-500/30 hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 strokeWidth={1.5} className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {fac.name}
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-white/60 font-medium">
                    {fac.departments.length} Bölüm
                  </p>
                </div>
              </button>
            ))}
            </div>
          </motion.div>
        )}

        {/* LEVEL 2: DEPARTMENTS */}
        {activeFaculty && !activeDepartment && (
          <motion.div 
            key="departments"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <button onClick={handleBack} className="p-2 hover:bg-[#f4f1ea] dark:hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft strokeWidth={1.5} className="w-5 h-5 text-stone-500" />
                </button>
                <h3 className="text-xl font-display font-bold text-stone-800 dark:text-white/90">
                  Bölüm Seçiniz
                </h3>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Bölüm ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9] dark:bg-[#264653] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeFaculty.departments || [])
                .filter(dep => dep.name.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr')))
                .map((dep) => (
                <button
                  key={dep.id}
                  onClick={async () => {
    if (!dep.courses && dep.sUnitId) {
      setLoading(true);
      try {
        const res = await fetch(getApiUrl(`/api/bologna/courses?sunit=${dep.sUnitId}`));
        if (res.ok) {
          const courseData = await res.json();
            const newDep = { ...dep, courses: courseData };
          setActiveDepartment(newDep);
        }
      } catch(err) {
        console.error(err);
        setActiveDepartment({ ...dep, courses: [] });
      }
      setLoading(false);
    } else if (!dep.courses) {
      setActiveDepartment({ ...dep, courses: [] });
    } else {
      setActiveDepartment(dep);
    }
  }}
                  className="flex flex-col p-6 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-500/30 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                      <GraduationCap strokeWidth={1.5} className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      {dep.name}
                    </h3>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-white/60 font-medium leading-relaxed">
                    {dep.description}
                  </p>
                  <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Müfredatı Görüntüle <ChevronRight strokeWidth={1.5} className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* LEVEL 3: COURSES (CURRICULUM) */}
        {activeDepartment && !activeCourse && (
          <motion.div 
            key="courses"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleBack} className="p-2 hover:bg-stone-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft strokeWidth={1.5} className="w-5 h-5 text-stone-500" />
              </button>
              <div>
                <h3 className="text-xl font-display font-bold text-stone-800 dark:text-white/90">
                  {activeDepartment.name} Müfredatı
                </h3>
              </div>
            </div>

            {/* In a real app, we'd group courses by semester. We'll group by semester here. */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map(semester => {
              const semCourses = activeDepartment.courses.filter(c => c.semester === semester);
              if (semCourses.length === 0) return null;
              
              return (
                <div key={semester} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-emerald-700 dark:text-amber-300 font-bold flex items-center justify-center">
                      {semester}
                    </div>
                    <h4 className="text-lg font-bold text-stone-800 dark:text-white/90">. Yarıyıl (Dönem)</h4>
                  </div>
                  
                  <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#f4f1ea] dark:bg-white/5 text-xs uppercase tracking-widest text-stone-500 dark:text-white/60">
                            <th className="py-3 px-4 font-semibold border-b border-[#e6e2d6] dark:border-white/10">Kodu</th>
                            <th className="py-3 px-4 font-semibold border-b border-[#e6e2d6] dark:border-white/10">Ders Adı</th>
                            <th className="py-3 px-4 font-semibold border-b border-[#e6e2d6] dark:border-white/10 text-center">Türü</th>
                            <th className="py-3 px-4 font-semibold border-b border-[#e6e2d6] dark:border-white/10 text-center">Kredi</th>
                            <th className="py-3 px-4 font-semibold border-b border-[#e6e2d6] dark:border-white/10 text-center">AKTS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semCourses.map(course => (
                            <tr 
                              key={course.id} 
                              onClick={async () => {
                              if (!course.detailsLoaded && course.detailTarget && activeDepartment?.sUnitId) {
                                setLoading(true);
                                try {
                                  const res = await fetch(getApiUrl(`/api/bologna/courseDetail?sunit=${activeDepartment.sUnitId}&target=${encodeURIComponent(course.detailTarget)}`));
                                  if (res.ok) {
                                    const details = await res.json();
                                    course.description = details.description || course.description;
                                    course.outcomes = details.outcomes || [];
                                    course.weeklyTopics = details.weeklyTopics || [];
                                    course.detailsLoaded = true;
                                  }
                                } catch(err) {
                                  console.error("Course detail fetch error", err);
                                }
                                setLoading(false);
                              }
                              setActiveCourse({...course});
                            }}
                              className="border-b border-stone-100 dark:border-white/5 hover:bg-[#f4f1ea] dark:hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <td className="py-3 px-4 text-sm font-semibold text-stone-700 dark:text-white/80 whitespace-nowrap">{course.code}</td>
                              <td className="py-3 px-4 text-sm font-bold text-amber-600 dark:text-amber-400">{course.name}</td>
                              <td className="py-3 px-4 text-sm text-center">
                                <span className={cn(
                                  "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider",
                                  course.type === 'Zorunlu' ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                                )}>
                                  {course.type}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm font-medium text-center text-stone-600 dark:text-white/60">{course.credit}</td>
                              <td className="py-3 px-4 text-sm font-bold text-center text-stone-800 dark:text-white/90">{course.ects}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* LEVEL 4: COURSE DETAILS */}
        {activeCourse && (
          <motion.div 
            key="course-detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <button onClick={handleBack} className="p-2 hover:bg-stone-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft strokeWidth={1.5} className="w-5 h-5 text-stone-500" />
              </button>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-white/80 text-xs font-bold tracking-widest uppercase">
                  {activeCourse.code}
                </span>
                <span className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-bold tracking-widest uppercase",
                  activeCourse.type === 'Zorunlu' ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                )}>
                  {activeCourse.type}
                </span>
              </div>
            </div>

            <h3 className="text-3xl md:text-4xl font-display font-black text-stone-900 dark:text-white ml-2 mb-6">
              {activeCourse.name}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#fcfbf9] dark:bg-[#264653] p-4 rounded-xl border border-[#e6e2d6] dark:border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">AKTS</span>
                <span className="text-2xl font-display font-bold text-amber-600 dark:text-amber-400">{activeCourse.ects}</span>
              </div>
              <div className="bg-[#fcfbf9] dark:bg-[#264653] p-4 rounded-xl border border-[#e6e2d6] dark:border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Yerel Kredi</span>
                <span className="text-2xl font-display font-bold text-stone-800 dark:text-white/90">{activeCourse.credit}</span>
              </div>
              <div className="bg-[#fcfbf9] dark:bg-[#264653] p-4 rounded-xl border border-[#e6e2d6] dark:border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Yarıyıl</span>
                <span className="text-2xl font-display font-bold text-stone-800 dark:text-white/90">{activeCourse.semester}.</span>
              </div>
              <div className="bg-[#fcfbf9] dark:bg-[#264653] p-4 rounded-xl border border-[#e6e2d6] dark:border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Eğitim Dili</span>
                <span className="text-lg font-display font-bold text-stone-800 dark:text-white/90">{activeCourse.language}</span>
              </div>
            </div>

            <div className="space-y-8 bg-[#fcfbf9] dark:bg-[#264653] p-6 md:p-8 rounded-2xl border border-[#e6e2d6] dark:border-white/10">
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white mb-3">
                  <FileText strokeWidth={1.5} className="w-5 h-5 text-amber-500" />
                  Dersin İçeriği ve Amacı
                </h4>
                <p className="text-stone-600 dark:text-white/60 leading-relaxed font-medium">
                  {activeCourse.description}
                </p>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white mb-4">
                  <CheckCircle2 strokeWidth={1.5} className="w-5 h-5 text-amber-500" />
                  Öğrenme Çıktıları
                </h4>
                {(activeCourse.outcomes && activeCourse.outcomes.length > 0) ? (
                  <ul className="space-y-3">
                    {activeCourse.outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-stone-600 dark:text-white/60 font-medium">
                        <div className="w-6 h-6 rounded-full bg-stone-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-stone-500 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="leading-relaxed">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-stone-500 italic text-sm">Bu ders için öğrenme çıktısı tanımlanmamış.</p>
                )}
              </div>
              
              {activeCourse.weeklyTopics && activeCourse.weeklyTopics.length > 0 && (
                <div className="pt-6 border-t border-stone-100 dark:border-white/10">
                  <h4 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white mb-4">
                    <BookOpen strokeWidth={1.5} className="w-5 h-5 text-amber-500" />
                    Haftalık Ders Konuları
                  </h4>
                  <div className="bg-[#f4f1ea] dark:bg-white/5 rounded-xl overflow-hidden border border-[#e6e2d6] dark:border-white/10">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-100 dark:bg-white/5 text-xs uppercase tracking-widest text-stone-500 dark:text-white/60">
                          <th className="py-3 px-4 font-semibold border-b border-[#e6e2d6] dark:border-white/10 w-24 text-center">Hafta</th>
                          <th className="py-3 px-4 font-semibold border-b border-[#e6e2d6] dark:border-white/10">Konu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeCourse.weeklyTopics.map((topic, idx) => (
                          <tr key={idx} className="border-b border-stone-100 dark:border-white/5 hover:bg-[#f4f1ea] dark:hover:bg-white/5">
                            <td className="py-3 px-4 text-sm font-bold text-stone-700 dark:text-white/80 text-center">{topic.week}</td>
                            <td className="py-3 px-4 text-sm font-medium text-stone-600 dark:text-white/60">{topic.topic}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
