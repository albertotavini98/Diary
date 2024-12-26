import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import type { Value } from 'react-calendar/dist/cjs/shared/types';
import DiaryEntry from './DiaryEntry';
import { diaryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import styled from 'styled-components';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const CalendarContainer = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  align-items: flex-start;

  .react-calendar {
    width: 350px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    margin-bottom: 2rem;

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
  padding: 1rem;
  background: #4869b0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #7eb3ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background: #6a9fee;
  }

  &.logout {
    background: #ff5252;
    
    &:hover {
      background: #ff3838;
    }
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: #d4e5ff;
`;

const EntryContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
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
  const [selectedDate, setSelectedDate] = useState<Value>(null);
  const [currentEntry, setCurrentEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const { logout } = useAuth();
  const navigate = useNavigate();

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

  // Move fetchAllEntries outside useEffect and reuse it
  useEffect(() => {
    fetchAllEntries();
  }, []);

  const fetchEntry = async (date: Value) => {
    if (!date || !(date instanceof Date)) {
      setCurrentEntry(null);
      return;
    }

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
    if (selectedDate instanceof Date) {
      fetchEntry(selectedDate);
    }
  }, [selectedDate]);

  const handleDateClick = (value: Value) => {
    if (value instanceof Date && selectedDate instanceof Date && 
        isSameDay(value, selectedDate)) {
      setSelectedDate(null);
    } else {
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
        date.getDate() + 1  // Add one day to compensate for timezone shift
      );
      
      // Format as YYYY-MM-DD
      const formattedDate = localDate.toISOString().split('T')[0];
      
      const response = await diaryApi.createEntry(formattedDate, content);
      
      // Update both current entry and entries cache
      setCurrentEntry(response.data);
      
      // Update entries state
      await fetchAllEntries();
      
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

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleDeleteEntry = async (date: string) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this entry?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await diaryApi.deleteEntry(date);
              setCurrentEntry(null);
              // Refresh all entries to update the calendar
              await fetchAllEntries();
            } catch (error) {
              console.error('Error deleting entry:', error);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
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
        {selectedDate && (
          <EntryContainer>
            <DiaryEntry 
              date={selectedDate instanceof Date ? selectedDate : new Date()}
              entry={currentEntry}
              onSave={handleSaveEntry}
              onDelete={currentEntry ? () => {
                if (selectedDate instanceof Date) {
                  handleDeleteEntry(getFormattedDate(selectedDate));
                }
              } : undefined}
              loading={loading}
            />
          </EntryContainer>
        )}
      </CalendarContainer>
    </PageContainer>
  );
};

export default DiaryCalendar;