import React, { useState, useEffect } from 'react';
import siteVisitService from '../../services/siteVisitService';
import { format, parse, startOfWeek, addDays, isSameDay, getDate } from 'date-fns';

const Reminders = ({ isDark }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [dailySummary, setDailySummary] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [counts, setCounts] = useState({ total_visits: 0, pending_visits: 0, upcoming_visits: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const today = new Date();
    const startOfTheWeek = startOfWeek(today, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const day = addDays(startOfTheWeek, i);
        return { day: format(day, 'EEE'), date: getDate(day), isSelected: isSameDay(day, today) };
    });
    setDailySummary(weekDays);

    const fetchReminderData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [upcomingVisits, summaryCounts] = await Promise.all([
          siteVisitService.getUpcomingSiteVisits(),
          siteVisitService.getSummaryCounts()
        ]);
        setSchedule(upcomingVisits);
        setCounts(summaryCounts);
      } catch (err) {
        setError("Failed to load reminder data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminderData();
  }, []);

  const handlePrevMonth = () => console.log("Previous Month");
  const handleNextMonth = () => console.log("Next Month");
  const handlePrevYear = () => console.log("Previous Year");
  const handleNextYear = () => console.log("Next Year");

  return (
    <div className={`w-full max-w-sm md:max-w-md lg:max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4 h-full flex flex-col`}>
      <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Reminders</h2>

      <div className="flex justify-between items-center mb-4 text-sm">
        <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <button onClick={handlePrevMonth} className={`px-1 rounded ${isDark ? 'hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-200 hover:text-black'}`}>{'<'}</button>
          <span>{currentMonth}</span>
          <button onClick={handleNextMonth} className={`px-1 rounded ${isDark ? 'hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-200 hover:text-black'}`}>{'>'}</button>
        </div>
        <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <button onClick={handlePrevYear} className={`px-1 rounded ${isDark ? 'hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-200 hover:text-black'}`}>{'<'}</button>
          <span>{currentYear}</span>
          <button onClick={handleNextYear} className={`px-1 rounded ${isDark ? 'hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-200 hover:text-black'}`}>{'>'}</button>
        </div>
      </div>

      <div className="flex justify-between mb-4 -mx-1">
        {dailySummary.map((item, idx) => (
          <div
            key={idx}
            className={`text-center p-2 rounded-lg transition cursor-pointer w-full mx-1 ${
              item.isSelected
                ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700')
                : (isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100')
            }`}
          >
            <div className="text-xs">{item.day}</div>
            <div className="font-semibold">{item.date}</div>
            <div className="h-1.5 mt-1"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 text-center mb-6">
        <div>
          <div className="text-lg font-bold text-green-600">{String(counts.total_visits).padStart(2, '0')}</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Visits</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-600">{String(counts.pending_visits).padStart(2, '0')}</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-600">{String(counts.upcoming_visits).padStart(2, '0')}</div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Upcoming</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <h3 className={`text-md font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Upcoming</h3>
        {isLoading ? (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        ) : error ? (
           <p className="text-sm text-red-500">{error}</p>
        ) : schedule.length > 0 ? (
            <div className="space-y-3 text-sm pr-1">
              {schedule.map((item) => {
                // CORRECTED LOGIC: Use the time string directly from the API.
                const formattedTime = item.time || 'N/A';
                const clientName = item.client_details?.full_name || item.client_name_manual || 'N/A';
                
                return (
                  <div key={item.id} className="flex">
                    <div className={`w-20 ${isDark ? 'text-gray-400' : 'text-gray-500'} text-right pr-2 flex-shrink-0`}>
                      <div>{formattedTime}</div>
                      <div className="truncate">{item.agent_details?.full_name || 'N/A'}</div>
                    </div>
                    <div className="w-1 mr-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{item.property_details?.title || 'Site Visit'}</p>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} truncate`}>Client: {clientName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
        ) : (
           <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No upcoming site visits.</p>
        )}
      </div>
    </div>
  );
};

export default Reminders;