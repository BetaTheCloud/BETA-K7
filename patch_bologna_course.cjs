const fs = require('fs');

let code = fs.readFileSync('src/pages/Bologna.tsx', 'utf8');

const replacement = `onClick={async () => {
                              if (!course.detailsLoaded && course.detailTarget && activeDepartment?.sUnitId) {
                                setLoading(true);
                                try {
                                  const res = await fetch(\`/api/bologna/courseDetail?sunit=\${activeDepartment.sUnitId}&target=\${encodeURIComponent(course.detailTarget)}\`);
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
                            }}`;

code = code.replace(`onClick={() => setActiveCourse(course)}`, replacement);

// We also need to display the weeklyTopics in the activeCourse view.
// Currently it shows: description, outcomes. We need to add weeklyTopics.
const oldOutcomesSection = `              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Öğrenme Çıktıları
                </h4>
                <ul className="space-y-3">
                  {(activeCourse.outcomes || []).map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 font-medium">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-slate-500 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>`;

const newWeeklyAndOutcomesSection = `              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Öğrenme Çıktıları
                </h4>
                {(activeCourse.outcomes && activeCourse.outcomes.length > 0) ? (
                  <ul className="space-y-3">
                    {activeCourse.outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 font-medium">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-slate-500 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="leading-relaxed">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic text-sm">Bu ders için öğrenme çıktısı tanımlanmamış.</p>
                )}
              </div>
              
              {activeCourse.weeklyTopics && activeCourse.weeklyTopics.length > 0 && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Haftalık Ders Konuları
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800/60">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/50 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          <th className="py-3 px-4 font-semibold border-b border-slate-200 dark:border-slate-800/60 w-24 text-center">Hafta</th>
                          <th className="py-3 px-4 font-semibold border-b border-slate-200 dark:border-slate-800/60">Konu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeCourse.weeklyTopics.map((topic, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 text-center">{topic.week}</td>
                            <td className="py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">{topic.topic}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}`;

code = code.replace(oldOutcomesSection, newWeeklyAndOutcomesSection);

fs.writeFileSync('src/pages/Bologna.tsx', code);
console.log("Patched Bologna.tsx with course details");
