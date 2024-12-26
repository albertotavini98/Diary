import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import type { Value } from 'react-calendar/dist/cjs/shared/types';
import DiaryEntry from './DiaryEntry';
import { diaryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import styled from 'styled-components';

const CalendarContainer = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  .react-calendar {
    width: 350px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .has-entry {
      background-color: #e6f3ff;
      color: #0056b3;
      font-weight: bold;

      &:hover {
        background-color: #cce5ff;
      }
    }
  }

  .react-calendar__tile--active {
    background: #007bff;
    color: white;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background: #0056b3;
  }

  &.logout {
    background: #dc3545;
    
    &:hover {
      background: #c82333;
    }
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

interface Entry {
  id: number;
  date: string;
  content: string;
}

const getFormattedDate = (date: Date) => {
  const adjustedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1
  );
  return adjustedDate.toISOString().split('T')[0];
};

const DiaryCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentEntry, setCurrentEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Fetch all entries when component mounts
  useEffect(() => {
    const fetchAllEntries = async () => {
      try {
        const response = await diaryApi.getEntries();
        const entriesMap: Record<string, Entry> = {};
        response.data.forEach((entry: Entry) => {
          // Ensure we're using the correct date format when storing entries
          const entryDate = new Date(entry.date);
          const adjustedDate = new Date(
            entryDate.getFullYear(),
            entryDate.getMonth(),
            entryDate.getDate() + 1
          );
          const formattedDate = adjustedDate.toISOString().split('T')[0];
          entriesMap[formattedDate] = entry;
        });
        setEntries(entriesMap);
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      }
    };

    fetchAllEntries();
  }, []);

  const fetchEntry = async (date: Date) => {
    // Adjust the date for fetching
    const adjustedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );
    const formattedDate = adjustedDate.toISOString().split('T')[0];
    
    console.log('Fetching entry for date:', date);
    console.log('Adjusted date:', adjustedDate);
    console.log('Formatted date:', formattedDate);
    
    // First check if we already have the entry in our cache
    if (entries[formattedDate]) {
      setCurrentEntry(entries[formattedDate]);
      return;
    }

    try {
      setLoading(true);
      const response = await diaryApi.getEntryByDate(formattedDate);
      setCurrentEntry(response.data);
      // Update entries cache
      setEntries(prev => ({
        ...prev,
        [formattedDate]: response.data
      }));
    } catch (error) {
      console.error('Failed to fetch entry:', error);
      setCurrentEntry(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry(selectedDate);
  }, [selectedDate]);

  const handleDateClick = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleSaveEntry = async (date: Date, content: string) => {
    try {
      setLoading(true);
      
      // Adjust for timezone offset
      const localDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() +1  // Add one day to compensate for timezone shift
      );
      
      // Format as YYYY-MM-DD
      const formattedDate = localDate.toISOString().split('T')[0];
      
      console.log('Calendar - Selected date:', date);
      console.log('Calendar - Adjusted local date:', localDate);
      console.log('Calendar - Formatted date:', formattedDate);
      
      const response = await diaryApi.createEntry(formattedDate, content);
      
      // Update both current entry and entries cache
      setCurrentEntry(response.data);
      setEntries(prev => ({
        ...prev,
        [formattedDate]: response.data
      }));
      
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Also add this function to help with date comparison
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = getFormattedDate(date);
    return entries[formattedDate] ? 'has-entry' : '';
  };

  const tileContent = ({ date }: { date: Date }) => {
    const formattedDate = getFormattedDate(date);
    return entries[formattedDate] ? <div className="entry-dot"></div> : null;
  };

  return (
    <PageContainer>
      <Header>
        <ButtonGroup>
          <Button onClick={() => navigate('/entries')}>
            View All Entries
          </Button>
          <Button className="logout" onClick={handleLogout}>
            Logout
          </Button>
        </ButtonGroup>
      </Header>
      <CalendarContainer>
        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          tileClassName={tileClassName}
          tileContent={tileContent}
        />
        <DiaryEntry 
          date={selectedDate}
          entry={currentEntry}
          onSave={handleSaveEntry}
          loading={loading}
        />
      </CalendarContainer>
    </PageContainer>
  );
};

export default DiaryCalendar;